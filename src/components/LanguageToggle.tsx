import React from "react"
import { Languages } from "lucide-react"
import { useI18n, type Language } from "../lib/i18n"
import IconButton from "./IconButton"

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useI18n()

  const toggleLanguage = () => {
    const newLang: Language = language === "zh" ? "en" : "zh"
    setLanguage(newLang)
  }

  return (
    <IconButton
      icon={<Languages size={16} />}
      onClick={toggleLanguage}
      ariaLabel={`${language === "zh" ? "中文" : "English"}`}
    />
  )
}

export default LanguageToggle

