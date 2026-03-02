import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { calcPower, fetchConfig } from "../api/n8n";
import { DEFAULT_CONFIG } from "../data/defaults";

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
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
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
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="right"
              dataKey="windSpeed"
              fill="#2a6fdb"
              name={t("chart.windSpeedColumn")}
            />
            <Line
              type="monotone"
              yAxisId="left"
              dataKey="power"
              stroke="#f97316"
              name={t("chart.power")}
            />
            <Line
              type="monotone"
              yAxisId="right"
              dataKey="windSpeed"
              stroke="#2a6fdb"
              name={t("chart.windSpeed")}
              strokeDasharray="6 4"
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
      {content}
    </div>
  );
}
