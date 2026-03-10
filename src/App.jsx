import { useTranslation } from "react-i18next";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_N8N_BASE_URL;
  const debugMode = import.meta.env.VITE_DEBUG_MODE === "1";
  const isMockMode = !baseUrl;
  const showDevBanner = debugMode;
  const showPlantName =
    location.pathname === "/config" || location.pathname === "/chart";

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
        <div className="topbar-left">
          <div className="brand">{t("appTitle")}</div>
        </div>
        <div className="topbar-center">
          {showPlantName ? t("common.plantName") : ""}
        </div>
        <div className="topbar-right">
          <nav className="nav">
            {!user ? (
              <>
                <Link to="/login">{t("nav.login")}</Link>
                <Link to="/register">{t("nav.register")}</Link>
              </>
            ) : (
              <>
                <Link to="/config">{t("nav.config")}</Link>
                <Link to="/chart">{t("nav.chart")}</Link>
                <button type="button" onClick={handleLogout}>
                  {t("nav.logout")}
                </button>
              </>
            )}
          </nav>
          <LanguageSwitcher />
        </div>
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
            <Route path="/chart" element={<Chart />} />
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
