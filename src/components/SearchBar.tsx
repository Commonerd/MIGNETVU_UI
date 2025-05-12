import { t } from "i18next"
import React, { useState } from "react"

interface SearchBarProps {
  onSearch: (query: string) => void // 검색어를 전달받는 콜백
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("") // 검색어 상태

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchQuery) // 검색어 전달
    } else if (e.key === "Escape") {
      setSearchQuery("") // ESC 키를 누르면 검색창 초기화
      onSearch("") // 빈 검색어 전달
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query) // 검색어 상태 업데이트
  }

  return (
    <div className="w-full p-2 flex items-center gap-2">
      {" "}
      {/* flexbox 적용 */}
      <input
        type="text"
        placeholder={t("Search Networks")}
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <button
        onClick={() => onSearch(searchQuery)}
        className="px-4 py-1 bg-amber-700 text-white rounded hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m1.94-7.15a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
          />
        </svg>
      </button>
    </div>
  )
}

export default SearchBar
