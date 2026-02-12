import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appTitle: "Wind Power Forecast",
      nav: {
        login: "Login",
        register: "Register",
        config: "Configuration",
        chart: "Line Chart",
        logout: "Logout",
      },
      common: {
        username: "Username",
        password: "Password",
        confirmPassword: "Confirm password",
        login: "Login",
        register: "Register",
        save: "Save",
        preview: "Preview",
        submit: "Submit",
        backToLogin: "Back to Login",
        goToRegister: "Create account",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        invalidJson: "Invalid JSON",
        language: "Language",
      },
      login: {
        title: "Login",
        invalid: "Invalid username or password.",
      },
      register: {
        title: "Register",
        mismatch: "Passwords do not match.",
        success: "Account created. You can login now.",
      },
      config: {
        title: "Configuration",
        hourly: "Hourly",
        daily: "Daily",
        weekly: "Weekly",
        plantLocation: "Plant location",
        latitude: "Latitude",
        longitude: "Longitude",
        totalCapacity: "Total plant capacity",
        turbineCount: "Number of turbines",
        powerCurve: "Turbine power curve (JSON)",
        loadError: "Could not load configuration.",
        saveSuccess: "Configuration saved.",
      },
      chart: {
        title: "Line Chart",
        windSpeed: "Wind speed",
        power: "Power",
        fetchError: "Could not fetch chart data.",
        saveSuccess: "Chart data saved.",
      },
    },
  },
  vi: {
    translation: {
      appTitle: "Dự báo điện gió",
      nav: {
        login: "Đăng nhập",
        register: "Đăng ký",
        config: "Cấu hình",
        chart: "Biểu đồ",
        logout: "Đăng xuất",
      },
      common: {
        username: "Tên đăng nhập",
        password: "Mật khẩu",
        confirmPassword: "Xác nhận mật khẩu",
        login: "Đăng nhập",
        register: "Đăng ký",
        save: "Lưu",
        preview: "Xem trước",
        submit: "Gửi",
        backToLogin: "Về đăng nhập",
        goToRegister: "Tạo tài khoản",
        loading: "Đang tải...",
        error: "Lỗi",
        success: "Thành công",
        invalidJson: "JSON không hợp lệ",
        language: "Ngôn ngữ",
      },
      login: {
        title: "Đăng nhập",
        invalid: "Sai tên đăng nhập hoặc mật khẩu.",
      },
      register: {
        title: "Đăng ký",
        mismatch: "Mật khẩu không trùng khớp.",
        success: "Tạo tài khoản thành công.",
      },
      config: {
        title: "Cấu hình",
        hourly: "Theo giờ",
        daily: "Theo ngày",
        weekly: "Theo tuần",
        plantLocation: "Vị trí nhà máy",
        latitude: "Vĩ độ",
        longitude: "Kinh độ",
        totalCapacity: "Tổng công suất",
        turbineCount: "Số lượng tua-bin",
        powerCurve: "Thông số kỹ thuật về turbine (JSON)",
        loadError: "Không thể tải cấu hình.",
        saveSuccess: "Đã lưu cấu hình.",
      },
      chart: {
        title: "Biểu đồ",
        windSpeed: "Tốc độ gió",
        power: "Công suất",
        fetchError: "Không thể tải dữ liệu.",
        saveSuccess: "Đã lưu dữ liệu biểu đồ.",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
