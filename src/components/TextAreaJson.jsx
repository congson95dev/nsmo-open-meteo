import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function TextAreaJson({ value, onChange }) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
  }, [value]);

  const handleChange = (event) => {
    const next = event.target.value;
    setText(next);
    try {
      const parsed = JSON.parse(next);
      setError("");
      onChange(parsed);
    } catch (err) {
      setError(t("common.invalidJson"));
    }
  };

  return (
    <div className="json-input">
      <textarea value={text} onChange={handleChange} rows={8} />
      {error ? <div className="error-text">{error}</div> : null}
    </div>
  );
}
