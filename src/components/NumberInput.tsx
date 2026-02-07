import { useState, useEffect, type InputHTMLAttributes } from 'react'

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
    value !== undefined ? String(value) : ''
  )

  useEffect(() => {
    // Only sync from parent if the numeric value actually changed
    const localNum = parseFloat(localValue)
    if (value !== undefined) {
      if (!isNaN(localNum) && localNum === value) return
      setLocalValue(String(value))
    } else {
      if (localValue === '') return
      setLocalValue('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const num = parseFloat(str)
    if (!isNaN(num)) {
      onChange(num)
    }
  }

  return <input type="number" value={localValue} onChange={handleChange} {...props} />
}
