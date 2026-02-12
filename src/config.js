export const APP_CONFIG = {
  n8nBaseUrl: import.meta?.env?.VITE_N8N_BASE_URL || "",
  endpoints: {
    login: "/login",
    register: "/register",
    config: "/config",
    calcPower: "/calc-power",
  },
};
