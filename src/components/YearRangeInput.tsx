import React, { useState, useEffect, useRef } from "react"
import type { ChangeEvent } from "react"

interface YearRangeInputProps {
  value: [number, number]
  onChange: (range: [number, number]) => void
  placeholderStart?: string
  placeholderEnd?: string
  min?: number
  max?: number
}

const YearRangeInputComponent: React.FC<YearRangeInputProps> = ({
  value,
  onChange,
  placeholderStart = "Start Year",
  placeholderEnd = "End Year",
  min = -5000,
  max = 5000,
}) => {
  const [start, setStart] = useState<number>(value[0])
  const [end, setEnd] = useState<number>(value[1])
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
    }, 1000)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end])

  // yyyy-mm-dd로 입력받기 위한 date 타입
  const formatDate = (val: number) => {
    if (!val) return ""
    if (typeof val === "string") return val
    const str = val.toString()
    if (str.length === 8) {
      return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`
    }
    return str
  }
  const parseDate = (val: string) => {
    if (!val) return 0
    return parseInt(val.replace(/-/g, ""))
  }
  const handleStartChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStart(parseDate(e.target.value))
  }
  const handleEndChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEnd(parseDate(e.target.value))
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        placeholder={placeholderStart}
        value={formatDate(start)}
        onChange={handleStartChange}
        className="w-28 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <span className="text-sm">-</span>
      <input
        type="date"
        placeholder={placeholderEnd}
        value={formatDate(end)}
        onChange={handleEndChange}
        className="w-28 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  )
}

const YearRangeInput = React.memo(YearRangeInputComponent)
export default React.memo(YearRangeInput)
