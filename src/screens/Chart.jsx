import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { calcPower, fetchConfig, saveConfig } from "../api/n8n";
import { DEFAULT_CONFIG } from "../data/defaults";
import LoadingButton from "../components/LoadingButton";

function normalizePeriod(period) {
  if (period === "daily" || period === "weekly") return period;
  return "hourly";
}

export default function Chart() {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const period = normalizePeriod(params.period || location.state?.period);
  const incomingConfig = location.state?.config;
  const [config, setConfig] = useState(
    incomingConfig || DEFAULT_CONFIG[period]
  );
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        let cfg = incomingConfig;
        if (!cfg) {
          const remote = await fetchConfig(period);
          cfg = remote || DEFAULT_CONFIG[period];
          if (active) setConfig(cfg);
        }
        const powerResponse = await calcPower({
          config: cfg,
          section: period,
        });
        const responseRows = powerResponse?.data || [];
        const powerValues = responseRows.length
          ? responseRows.map((row) => row.power_kw ?? row.power_mw ?? null)
          : powerResponse?.power || [];
        const windValues = responseRows.length
          ? responseRows.map((row) => row.wind_speed_ms ?? null)
          : [];
        const rows = powerValues.map((_, index) => ({
          time: `T${index + 1}`,
          windSpeed: windValues[index] ?? null,
          power: powerValues[index] ?? null,
        }));
        if (active) setData(rows);
      } catch (err) {
        if (active) setError(err.message || t("chart.fetchError"));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [incomingConfig, period, t]);

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await saveConfig({ period, config });
      setSuccess(t("config.saveSuccess"));
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const content = useMemo(() => {
    if (loading) {
      return <div className="card">{t("common.loading")}</div>;
    }
    if (!data.length) {
      return <div className="card">{t("chart.fetchError")}</div>;
    }
    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="windSpeed"
              stroke="#2a6fdb"
              name={t("chart.windSpeed")}
            />
            <Line
              type="monotone"
              dataKey="power"
              stroke="#f97316"
              name={t("chart.power")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }, [data, loading, t]);

  return (
    <div className="screen">
      <h1>{t("chart.title")}</h1>
      {error ? <div className="error-text">{error}</div> : null}
      {success ? <div className="success-text">{success}</div> : null}
      {content}
      <LoadingButton isLoading={saving} onClick={handleSubmit}>
        {t("common.submit")}
      </LoadingButton>
    </div>
  );
}
