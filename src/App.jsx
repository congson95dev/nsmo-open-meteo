import { useTranslation } from "react-i18next";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import LanguageSwitcher from "./components/LanguageSwitcher";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Config from "./screens/Config";
import Chart from "./screens/Chart";

function AppLayout({ children }) {
  const { t } = useTranslation();
  const { user, setUser } = useAppContext();
  const baseUrl = import.meta.env.VITE_N8N_BASE_URL;
  const debugMode = import.meta.env.VITE_DEBUG_MODE === "1";
  const isMockMode = !baseUrl;
  const showDevBanner = debugMode;

  const handleLogout = () => setUser(null);

  return (
    <div className="app">
      {showDevBanner ? (
        <div className={`mock-banner ${isMockMode ? "mock-on" : "mock-off"}`}>
          <strong>API mode:</strong>{" "}
          {isMockMode ? "MOCK" : "REAL"} |{" "}
          <strong>base URL:</strong> {baseUrl || "empty"}
        </div>
      ) : null}
      <header className="topbar">
        <div className="brand">{t("appTitle")}</div>
        <nav className="nav">
          {!user ? (
            <>
              <Link to="/login">{t("nav.login")}</Link>
              <Link to="/register">{t("nav.register")}</Link>
            </>
          ) : (
            <>
              <Link to="/config">{t("nav.config")}</Link>
              <Link to="/chart/hourly">{t("nav.chart")}</Link>
              <button type="button" onClick={handleLogout}>
                {t("nav.logout")}
              </button>
            </>
          )}
        </nav>
        <LanguageSwitcher />
      </header>
      <main className="main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/app">
      <AppLayout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/config" element={<Config />} />
            <Route path="/chart/:period" element={<Chart />} />
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
