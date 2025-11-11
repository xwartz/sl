import React from "react"

interface IconButtonProps {
  icon: React.ReactNode
  onClick: () => void
  ariaLabel: string
  disabled?: boolean
  className?: string
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  ariaLabel,
  disabled = false,
  className = "",
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false)

  const handleClick = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`btn-secondary h-10 w-10 flex items-center justify-center rounded-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={ariaLabel}
      type="button"
    >
      <span
        className={`inline-flex transition-all duration-300 ${
          isAnimating ? "rotate-180 scale-90" : "rotate-0 scale-100"
        }`}
      >
        {icon}
      </span>
    </button>
  )
}

export default IconButton

