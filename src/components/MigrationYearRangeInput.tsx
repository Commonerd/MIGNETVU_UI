/// <reference types="react" />
import * as React from "react"
import { useState, useEffect, useRef } from "react"
import type { ChangeEvent } from "react"

interface MigrationYearRangeInputProps {
  value: [number, number]
  onChange: (range: [number, number]) => void
  placeholderStart?: string
  placeholderEnd?: string
}

const MigrationYearRangeInputComponent: React.FC<
  MigrationYearRangeInputProps
> = ({
  value,
  onChange,
  placeholderStart = "Start Year",
  placeholderEnd = "End Year",
}: MigrationYearRangeInputProps) => {
  const [start, setStart] = useState<number>(value[0])
  const [end, setEnd] = useState<number>(value[1])
  const [startInput, setStartInput] = useState<string>("")
  const [endInput, setEndInput] = useState<string>("")
  /**
   * @type {React.MutableRefObject<NodeJS.Timeout | null>}
   */
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setStart(value[0])
    setEnd(value[1])
    setStartInput(formatDate(value[0]))
    setEndInput(formatDate(value[1]))
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
    if (typeof val === "string") return val
    const str = val.toString()
    if (str.length === 8) {
      return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`
    }
    if (str.length === 4) {
      return `${str}-01-01`
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
        value={startInput}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          let val = e.target.value
          let year = val.split("-")[0]
          if (year.length > 4) {
            year = year.slice(0, 4)
            val = year + val.slice(4)
          }
          setStart(parseDate(val))
          setStartInput(val)
        }}
        onFocus={() => {
          setStartInput("")
          setStart(0)
        }}
        className="w-28 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        pattern="\\d{4}-\\d{2}-\\d{2}"
      />
      <span className="text-sm">-</span>
      <input
        type="date"
        placeholder={placeholderEnd}
        value={endInput}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          let val = e.target.value
          let year = val.split("-")[0]
          if (year.length > 4) {
            year = year.slice(0, 4)
            val = year + val.slice(4)
          }
          setEnd(parseDate(val))
          setEndInput(val)
        }}
        onFocus={() => {
          setEndInput("")
          setEnd(0)
        }}
        className="w-28 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        pattern="\\d{4}-\\d{2}-\\d{2}"
      />
    </div>
  )
}

const MigrationYearRangeInput = React.memo(MigrationYearRangeInputComponent)
export default React.memo(MigrationYearRangeInput)
