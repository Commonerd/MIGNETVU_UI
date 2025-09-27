/// <reference types="react" />
import * as React from "react"
import { useState, useEffect, useRef } from "react"
import type { ChangeEvent } from "react"

interface MigrationYearRangeInputProps {
  value: [number, number]
  onChange: (range: [number, number]) => void
  placeholderStart?: string
  placeholderEnd?: string
  min?: number
  max?: number
}

const MigrationYearRangeInputComponent: React.FC<
  MigrationYearRangeInputProps
> = ({
  value,
  onChange,
  placeholderStart = "Start Year",
  placeholderEnd = "End Year",
  min = -5000,
  max = 5000,
}: MigrationYearRangeInputProps) => {
  const [start, setStart] = useState<number>(value[0])
  const [end, setEnd] = useState<number>(value[1])
  /**
   * @type {React.MutableRefObject<NodeJS.Timeout | null>}
   */
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

  // yyyy-mm-dd로 입력받기 위한 date 타입
  const formatDate = (val: number) => {
    if (!val) return ""
    // val이 yyyy-mm-dd 형태의 숫자라면 string으로 변환
    if (typeof val === "string") return val
    // val이 20230927 형태라면 yyyy-mm-dd로 변환
    const str = val.toString()
    if (str.length === 8) {
      return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`
    }
    return str
  }
  const parseDate = (val: string) => {
    if (!val) return 0
    // yyyy-mm-dd를 20230927 형태의 숫자로 변환
    return parseInt(val.replace(/-/g, ""))
  }
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        placeholder={placeholderStart}
        value={formatDate(start)}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setStart(parseDate(e.target.value))
        }
        className="w-28 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <span className="text-sm">-</span>
      <input
        type="date"
        placeholder={placeholderEnd}
        value={formatDate(end)}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setEnd(parseDate(e.target.value))
        }
        className="w-28 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  )
}

const MigrationYearRangeInput = React.memo(MigrationYearRangeInputComponent)
export default React.memo(MigrationYearRangeInput)
