import { BrowserRouter, Routes, Route } from "react-router-dom"
import PositionCalculator from "./components/PositionCalculator"
import ThemeToggle from "./components/ThemeToggle"
import LanguageToggle from "./components/LanguageToggle"
import { Calculator } from "lucide-react"
import { useI18n } from "./lib/i18n"

function App() {
  const { t } = useI18n()

  return (
    <BrowserRouter>
      <div className="min-h-screen app-root">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border-var bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="container mx-auto max-w-[1600px] px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <Calculator size={20} className="text-text" />
                <h1 className="text-lg font-semibold tracking-tight text-text">
                  {t("position.title")}
                </h1>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-app-bg">
          <Routes>
            <Route path="/" element={<PositionCalculator />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
