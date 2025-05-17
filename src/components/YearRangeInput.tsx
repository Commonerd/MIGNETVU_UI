import React, { useState, useEffect, useRef } from "react"

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
  min = -5000,
  max = 5000,
}) => {
  const [start, setStart] = useState(value[0])
  const [end, setEnd] = useState(value[1])
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // 외부 값이 바뀌면 내부 상태도 동기화
  useEffect(() => {
    setStart(value[0])
    setEnd(value[1])
  }, [value])

  // 디바운스 적용: 입력 후 0.7초 뒤에 onChange 호출
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange([start, end])
    }, 700)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end])

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? 0 : parseInt(e.target.value)
    setStart(val)
  }
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? 0 : parseInt(e.target.value)
    setEnd(val)
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
