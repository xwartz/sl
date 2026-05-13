import { Moon, Sun } from 'lucide-react'
import type React from 'react'
import { useI18n } from '../lib/i18n'
import { useTheme } from '../lib/theme-context'
import IconButton from './IconButton'

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  const isDark = theme === 'dark'

  return (
    <IconButton
      icon={isDark ? <Sun size={16} /> : <Moon size={16} />}
      onClick={toggleTheme}
      ariaLabel={t('theme.toggle')}
    />
  )
}

export default ThemeToggle
