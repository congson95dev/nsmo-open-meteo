export const APP_CONFIG = {
  n8nBaseUrl: import.meta?.env?.VITE_N8N_BASE_URL || "",
  xlsxApiUrl:
    import.meta?.env?.VITE_XLSX_API_URL ||
    "https://stdirm.ezn8n.com/webhook/calc-xlsx",
  endpoints: {
    login: "/login",
    register: "/register",
    config: "/config",
    calcPower: "/calc-power",
  },
};
