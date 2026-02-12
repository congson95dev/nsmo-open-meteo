import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerUser } from "../api/n8n";
import LoadingButton from "../components/LoadingButton";

export default function Register() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError(t("register.mismatch"));
      return;
    }
    setLoading(true);
    try {
      await registerUser({ username: username.trim(), password });
      setSuccess(t("register.success"));
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <h1>{t("register.title")}</h1>
      <form onSubmit={handleSubmit} className="card">
        <label>
          {t("common.username")}
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label>
          {t("common.password")}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label>
          {t("common.confirmPassword")}
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>
        {error ? <div className="error-text">{error}</div> : null}
        {success ? <div className="success-text">{success}</div> : null}
        <LoadingButton type="submit" isLoading={loading}>
          {t("common.register")}
        </LoadingButton>
      </form>
      <Link to="/login" className="link">
        {t("common.backToLogin")}
      </Link>
    </div>
  );
}
