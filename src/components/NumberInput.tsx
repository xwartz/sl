import { type InputHTMLAttributes, useEffect, useState } from 'react'

interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
  > {
  value: number | undefined
  onChange: (value: number | undefined) => void
  allowEmpty?: boolean
}

export default function NumberInput({
  value,
  onChange,
  allowEmpty = false,
  ...props
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(
    value !== undefined ? String(value) : '',
  )

  useEffect(() => {
    setLocalValue(currentValue => {
      const currentNumber = Number.parseFloat(currentValue)

      if (value !== undefined) {
        if (!Number.isNaN(currentNumber) && currentNumber === value) {
          return currentValue
        }

        return String(value)
      }

      return currentValue === '' ? currentValue : ''
    })
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value
    setLocalValue(str)

    if (str === '' || str === '-') {
      if (allowEmpty) {
        onChange(undefined)
      }
      return
    }

    const num = Number.parseFloat(str)
    if (!Number.isNaN(num)) {
      onChange(num)
    }
  }

  return (
    <input
      type="number"
      value={localValue}
      onChange={handleChange}
      {...props}
    />
  )
}
