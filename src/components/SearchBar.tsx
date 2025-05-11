import { t } from "i18next"
import React, { useEffect, useMemo, useState } from "react"
import { debounce } from "lodash"

interface SearchBarProps {
  // searchQuery: string
  // setSearchQuery: (query: string) => void
  // handleSearchChange: (query: string) => void
  onSearch: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  // searchQuery,
  // setSearchQuery,
  // handleSearchChange,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("") // 검색어 상태
  // const [debouncedQuery, setDebouncedQuery] = useState("") // 디바운싱된 검색어 상태

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch()
    } else if (e.key === "Escape") {
      onSearch()
      setSearchQuery("") // ESC 키를 누르면 검색창 초기화
    }
  }

  // // 디바운싱된 검색어 업데이트 함수
  // const updateDebouncedQuery = useMemo(
  //   () =>
  //     debounce((query: string) => {
  //       setDebouncedQuery(query)
  //     }, 300), // 300ms 지연
  //   [],
  // )

  // 검색어 입력 핸들러
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query) // 즉시 검색어 상태 업데이트
    // updateDebouncedQuery(query) // 디바운싱된 검색어 업데이트
  }

  // // 디바운싱된 검색어가 변경될 때 부모 컴포넌트로 전달
  // useEffect(() => {
  //   onSearch()
  // }, [debouncedQuery, onSearch])

  return (
    <div className="w-full p-2">
      <input
        type="text"
        placeholder={t("Search Networks")}
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  )
}

export default SearchBar
