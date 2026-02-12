import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchUser } from "../api/n8n";
import { useAppContext } from "../context/AppContext";
import LoadingButton from "../components/LoadingButton";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useAppContext();
  const baseUrl = import.meta.env.VITE_N8N_BASE_URL;
  const debugMode = import.meta.env.VITE_DEBUG_MODE === "1";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      // eslint-disable-next-line no-console
      console.log("[login] submit", { username });
      setDebugInfo(
        `submit: ${new Date().toISOString()} | baseUrl: ${baseUrl || "empty"}`
      );
      const data = await fetchUser(username.trim(), password);
      // eslint-disable-next-line no-console
      console.log("[login] response", data);
      setDebugInfo((prev) => `${prev} | response: ${JSON.stringify(data)}`);
      if (!data?.success) {
        setError(t("login.invalid"));
        return;
      }
      setUser({ username: data?.username || username.trim() });
      navigate("/config");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("[login] error", err);
      setDebugInfo(
        (prev) => `${prev} | error: ${err?.message || "unknown"}`
      );
      setError(err.message || t("login.invalid"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <h1>{t("login.title")}</h1>
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
      {error ? <div className="error-text">{error}</div> : null}
      {debugMode ? (
        <div className="debug-box">
          <div>debug</div>
          <div>{debugInfo || "no activity yet"}</div>
        </div>
      ) : null}
      <LoadingButton type="submit" isLoading={loading}>
        {t("common.login")}
      </LoadingButton>
      </form>
      <Link to="/register" className="link">
        {t("common.goToRegister")}
      </Link>
    </div>
  );
}
