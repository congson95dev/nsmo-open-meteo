import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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
} from "recharts";
import { calcPower, calcXlsx, fetchConfig } from "../api/n8n";
import { DEFAULT_CONFIG } from "../data/defaults";
import { exportForecastXlsx } from "../utils/xlsxExport";

const PERIOD_OPTIONS = [
  { key: "hourly", labelKey: "chart.forecastHourly" },
  { key: "daily", labelKey: "chart.forecastDaily" },
  { key: "weekly", labelKey: "chart.forecastWeekly" },
];

function normalizePeriod(period) {
  if (period === "daily" || period === "weekly") return period;
  return "hourly";
}

function getMilestoneStep(period, length) {
  const base = period === "daily" ? 7 : period === "weekly" ? 4 : 24;
  if (length <= base * 2) return Math.max(1, Math.ceil(length / 8));
  return base;
}

function getTimeUnitKey(period) {
  if (period === "daily") return "day";
  if (period === "weekly") return "week";
  return "hour";
}

function parseApiTime(value) {
  if (!value) return null;
  const raw = String(value);
  const isoCandidate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)
    ? `${raw}:00`
    : raw;
  const date = new Date(isoCandidate);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatAxisTime(value, period) {
  const parsed = parseApiTime(value);
  if (!parsed) return String(value ?? "");
  if (period === "weekly" || period === "daily") {
    return new Intl.DateTimeFormat(undefined, {
      month: "2-digit",
      day: "2-digit",
    }).format(parsed);
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

function formatTooltipTime(value) {
  const parsed = parseApiTime(value);
  if (!parsed) return String(value ?? "");
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

function readCalcPowerPayload(payload) {
  if (Array.isArray(payload)) return payload[0] || {};
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload?.data) && payload.data[0]?.rows) {
    return payload.data[0] || {};
  }
  return payload || {};
}

export default function Chart() {
  const { t } = useTranslation();
  const location = useLocation();
  const previewPeriod = normalizePeriod(location.state?.period);
  const previewConfig = location.state?.config;
  const [period, setPeriod] = useState(previewPeriod);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPeriod, setLoadingPeriod] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.period) {
      setPeriod(previewPeriod);
    }
  }, [location.state, previewPeriod]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        let cfg = period === previewPeriod ? previewConfig : null;
        if (!cfg) {
          const remote = await fetchConfig(period);
          cfg = remote || DEFAULT_CONFIG[period];
        }
        const powerResponse = await calcPower({
          config: cfg,
          section: period,
        });
        const calcPayload = readCalcPowerPayload(powerResponse);
        const responseRows = Array.isArray(calcPayload?.rows)
          ? calcPayload.rows
          : Array.isArray(calcPayload?.data)
            ? calcPayload.data
            : [];
        const responseTime = calcPayload?.time || [];
        const rows = responseRows.length
          ? responseRows.map((row, index) => {
              const fallbackIndexTime = String(index + 1);
              return {
                time: responseTime[index] ?? row?.time ?? fallbackIndexTime,
                windSpeed: row?.wind_speed_ms ?? null,
                power: row?.power_kw ?? row?.power_mw ?? null,
              };
            })
          : (calcPayload?.power || []).map((power, index) => ({
              time: responseTime[index] ?? String(index + 1),
              windSpeed: null,
              power: power ?? null,
            }));
        if (active) setData(rows);
      } catch (err) {
        if (active) setError(err.message || t("chart.fetchError"));
      } finally {
        if (active) {
          setLoading(false);
          setLoadingPeriod(null);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [period, previewConfig, previewPeriod, t]);

  const content = useMemo(() => {
    if (loading) {
      return <div className="card">{t("common.loading")}</div>;
    }
    if (!data.length) {
      return <div className="card">{t("chart.fetchError")}</div>;
    }
    const step = getMilestoneStep(period, data.length);
    const ticks = [];
    for (let i = 0; i < data.length; i += step) ticks.push(data[i].time);
    const lastTime = data[data.length - 1]?.time;
    if (lastTime && !ticks.includes(lastTime)) ticks.push(lastTime);

    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 52 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="category"
              dataKey="time"
              ticks={ticks}
              tickFormatter={(value) => formatAxisTime(value, period)}
              minTickGap={24}
              label={{
                value: t("chart.timeAxis", {
                  unit: t(`chart.timeUnits.${getTimeUnitKey(period)}`),
                }),
                position: "bottom",
                offset: 20,
              }}
            />
            <YAxis
              yAxisId="left"
              label={{
                value: t("chart.powerUnit"),
                angle: -90,
                position: "insideBottomLeft",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{
                value: t("chart.windSpeedUnit"),
                angle: 90,
                position: "insideBottomRight",
              }}
            />
            <Tooltip labelFormatter={(value) => formatTooltipTime(value)} />
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
        <div className="chart-legend" aria-label="chart legend">
          <span className="chart-legend-item">
            <span
              className="chart-legend-marker chart-legend-marker-power"
              aria-hidden="true"
            />
            {t("chart.power")}
          </span>
          <span className="chart-legend-item">
            <span
              className="chart-legend-marker chart-legend-marker-wind"
              aria-hidden="true"
            />
            {t("chart.windSpeed")}
          </span>
        </div>
      </div>
    );
  }, [data, loading, period, t]);

  const handleExportXlsx = async () => {
    if (loading || exporting) return;
    setExporting(true);
    setError("");
    try {
      let cfg = period === previewPeriod ? previewConfig : null;
      if (!cfg) {
        const remote = await fetchConfig(period);
        cfg = remote || DEFAULT_CONFIG[period];
      }
      const xlsxResponse = await calcXlsx({
        config: cfg,
        section: period,
      });
      const exportRows = Array.isArray(xlsxResponse?.data)
        ? xlsxResponse.data
        : Array.isArray(xlsxResponse?.data?.rows)
          ? xlsxResponse.data.rows
          : [];
      if (!exportRows.length) {
        throw new Error(t("chart.exportNoData"));
      }
      await exportForecastXlsx({
        period,
        rows: exportRows,
        plantName: t("common.plantName"),
      });
    } catch (err) {
      setError(err.message || t("chart.exportError"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="screen">
      <h1>{t(`chart.forecastTitles.${period}`)}</h1>
      <div className="period-switch">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`period-btn ${period === option.key ? "is-active" : ""}`}
            onClick={() => {
              if (loading || exporting || period === option.key) return;
              setLoadingPeriod(option.key);
              setPeriod(option.key);
            }}
            disabled={loading || exporting}
          >
            {loading && loadingPeriod === option.key ? (
              <span className="button-spinner" aria-hidden="true" />
            ) : null}
            {t(option.labelKey)}
          </button>
        ))}
        <button
          type="button"
          className="chart-export-btn"
          disabled={loading || exporting}
          onClick={handleExportXlsx}
        >
          {exporting ? t("chart.exporting") : t("chart.exportCsv")}
        </button>
      </div>
      {error ? <div className="error-text">{error}</div> : null}
      {content}
    </div>
  );
}
