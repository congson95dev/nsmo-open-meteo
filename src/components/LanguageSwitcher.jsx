import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/AppContext";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const { language, setLanguage } = useAppContext();

  const handleChange = (event) => {
    const next = event.target.value;
    setLanguage(next);
    i18n.changeLanguage(next);
  };

  return (
    <select
      value={language}
      onChange={handleChange}
      aria-label={t("common.language")}
    >
      <option value="en">EN</option>
      <option value="vi">VI</option>
    </select>
  );
}
