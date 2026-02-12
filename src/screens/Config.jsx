import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchConfig, saveConfig } from "../api/n8n";
import { DEFAULT_CONFIG } from "../data/defaults";
import LoadingButton from "../components/LoadingButton";
import SectionCard from "../components/SectionCard";
import TextAreaJson from "../components/TextAreaJson";

const SECTIONS = [
  { key: "hourly", labelKey: "config.hourly" },
  { key: "daily", labelKey: "config.daily" },
  { key: "weekly", labelKey: "config.weekly" },
];

export default function Config() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [hourly, daily, weekly] = await Promise.all([
          fetchConfig("hourly"),
          fetchConfig("daily"),
          fetchConfig("weekly"),
        ]);
        if (!active) return;
        setConfig({
          hourly: hourly || DEFAULT_CONFIG.hourly,
          daily: daily || DEFAULT_CONFIG.daily,
          weekly: weekly || DEFAULT_CONFIG.weekly,
        });
      } catch (err) {
        if (active) setError(t("config.loadError"));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [t]);

  const handleChange = (sectionKey, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  const handlePreview = (sectionKey) => {
    navigate(`/chart/${sectionKey}`, {
      state: { config: config[sectionKey], period: sectionKey },
    });
  };

  const handleSave = async (sectionKey) => {
    setSaving((prev) => ({ ...prev, [sectionKey]: true }));
    setError("");
    setSuccess("");
    try {
      await saveConfig({ period: sectionKey, config: config[sectionKey] });
      setSuccess(t("config.saveSuccess"));
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setSaving((prev) => ({ ...prev, [sectionKey]: false }));
    }
  };

  const content = useMemo(() => {
    if (loading) {
      return <div className="card">{t("common.loading")}</div>;
    }
    return SECTIONS.map((section) => {
      const value = config[section.key];
      return (
        <SectionCard
          key={section.key}
          title={t(section.labelKey)}
          actions={
            <>
              <button type="button" onClick={() => handlePreview(section.key)}>
                {t("common.preview")}
              </button>
              <LoadingButton
                type="button"
                isLoading={!!saving[section.key]}
                onClick={() => handleSave(section.key)}
              >
                {t("common.save")}
              </LoadingButton>
            </>
          }
        >
          <div className="group-title">{t("config.plantLocation")}</div>
          <div className="grid">
            <label>
              {t("config.latitude")}
              <input
                type="number"
                value={value.latitude}
                onChange={(event) =>
                  handleChange(section.key, "latitude", Number(event.target.value))
                }
                step="0.0001"
              />
            </label>
            <label>
              {t("config.longitude")}
              <input
                type="number"
                value={value.longitude}
                onChange={(event) =>
                  handleChange(section.key, "longitude", Number(event.target.value))
                }
                step="0.0001"
              />
            </label>
            <label>
              {t("config.totalCapacity")}
              <input
                type="number"
                value={value.totalCapacity}
                onChange={(event) =>
                  handleChange(
                    section.key,
                    "totalCapacity",
                    Number(event.target.value)
                  )
                }
                step="0.1"
              />
            </label>
            <label>
              {t("config.turbineCount")}
              <input
                type="number"
                value={value.turbineCount}
                onChange={(event) =>
                  handleChange(
                    section.key,
                    "turbineCount",
                    Number(event.target.value)
                  )
                }
                step="1"
              />
            </label>
          </div>
          <label>
            {t("config.powerCurve")}
            <TextAreaJson
              value={value.powerCurve}
              onChange={(next) =>
                handleChange(section.key, "powerCurve", next)
              }
            />
          </label>
        </SectionCard>
      );
    });
  }, [config, loading, saving, t]);

  return (
    <div className="screen">
      <h1>{t("config.title")}</h1>
      {error ? <div className="error-text">{error}</div> : null}
      {success ? <div className="success-text">{success}</div> : null}
      {content}
    </div>
  );
}
