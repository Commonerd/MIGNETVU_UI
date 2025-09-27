import React from "react"

interface YearRangeInputProps {
  label: string
  value: [string, string]
  onChange: (index: 0 | 1, value: string) => void
}

const YearRangeInput: React.FC<YearRangeInputProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]">
      <label className="text-sm">{label}</label>
      <input
        type="date"
        value={value[0]}
        onChange={(e) => onChange(0, e.target.value)}
        className="border rounded px-2 py-1"
        min="0000-01-01"
        max="3000-12-31"
      />
      <span>~</span>
      <input
        type="date"
        value={value[1]}
        onChange={(e) => onChange(1, e.target.value)}
        className="border rounded px-2 py-1"
        min="0000-01-01"
        max="3000-12-31"
      />
    </div>
  )
}

export default React.memo(YearRangeInput)
