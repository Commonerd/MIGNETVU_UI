import { t } from "i18next"
import React from "react"

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearch: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch()
    } else if (e.key === "Escape") {
      setSearchQuery("") // ESC 키를 누르면 검색창 초기화
    }
  }

  return (
    <div className="w-full p-2">
      <input
        type="text"
        placeholder={t("Search Networks")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  )
}

export default SearchBar
