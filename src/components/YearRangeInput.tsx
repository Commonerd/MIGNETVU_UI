import React, { useState, useEffect } from "react"

interface YearRangeInputProps {
  value: [number, number]
  onChange: (range: [number, number]) => void
  placeholderStart?: string
  placeholderEnd?: string
  min?: number
  max?: number
}

const YearRangeInput: React.FC<YearRangeInputProps> = ({
  value,
  onChange,
  placeholderStart = "Start Year",
  placeholderEnd = "End Year",
  min = 0,
  max = 2100,
}) => {
  const [start, setStart] = useState(value[0])
  const [end, setEnd] = useState(value[1])

  // 외부 값이 바뀌면 내부 상태도 동기화
  useEffect(() => {
    setStart(value[0])
    setEnd(value[1])
  }, [value])

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? 0 : parseInt(e.target.value)
    setStart(val)
    onChange([val, end])
  }
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? 0 : parseInt(e.target.value)
    setEnd(val)
    onChange([start, val])
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={min}
        max={max}
        placeholder={placeholderStart}
        value={start === 0 ? "" : start}
        onChange={handleStartChange}
        className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <span className="text-sm">-</span>
      <input
        type="number"
        min={min}
        max={max}
        placeholder={placeholderEnd}
        value={end === 0 ? "" : end}
        onChange={handleEndChange}
        className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  )
}

export default YearRangeInput
