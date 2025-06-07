import React, { useState, useEffect, useRef } from "react"

interface MigrationYearRangeInputProps {
  value: [number, number]
  onChange: (range: [number, number]) => void
  placeholderStart?: string
  placeholderEnd?: string
  min?: number
  max?: number
}

const MigrationYearRangeInput: React.FC<MigrationYearRangeInputProps> = ({
  value,
  onChange,
  placeholderStart = "Start Year",
  placeholderEnd = "End Year",
  min = -5000,
  max = 5000,
}) => {
  const [start, setStart] = useState(value[0])
  const [end, setEnd] = useState(value[1])
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setStart(value[0])
    setEnd(value[1])
  }, [value])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange([start, end])
    }, 1000)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [start, end])

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={min}
        max={max}
        placeholder={placeholderStart}
        value={start === 0 ? "" : start}
        onChange={(e) =>
          setStart(e.target.value === "" ? 0 : parseInt(e.target.value))
        }
        className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <span className="text-sm">-</span>
      <input
        type="number"
        min={min}
        max={max}
        placeholder={placeholderEnd}
        value={end === 0 ? "" : end}
        onChange={(e) =>
          setEnd(e.target.value === "" ? 0 : parseInt(e.target.value))
        }
        className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  )
}

export default MigrationYearRangeInput
