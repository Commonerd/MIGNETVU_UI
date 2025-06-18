import { FC, useState } from "react"
import { useQuerySearchNetworks } from "../hooks/useQueryNetworks"
import { NetworkItem } from "./NetworkItem"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { FiSearch, FiX } from "react-icons/fi" // 아이콘 추가

interface SearchResultsProps {
  searchQuery: string
  setFocusedNode: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >
  handleEntityClick: (id: number) => void
  handleMigrationTraceClick: (networkId: number) => void
  handleEdgeClick: (edgeId: number) => void
  handleNetworkEdgesToggle: (networkId: number) => void
}

const SearchResults: FC<SearchResultsProps> = ({
  searchQuery,
  setFocusedNode,
  handleEntityClick,
  handleMigrationTraceClick,
  handleEdgeClick,
  handleNetworkEdgesToggle,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [isVisible, setIsVisible] = useState(true) // 검색창 표시 여부 상태 추가
  const { t } = useTranslation()
  const { data, isLoading, error } = useQuerySearchNetworks(
    searchQuery,
    currentPage,
  )

  const queryClient = useQueryClient()

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleClearCache = () => {
    queryClient.invalidateQueries({ queryKey: ["searchNetworks"] })
    alert("Cache has been cleared!")
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)} // 검색창 다시 표시
        className="fixed top-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition"
      >
        <FiSearch size={20} /> {/* 검색 아이콘 */}
      </button>
    )
  }

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  const totalPages = data?.totalPages || 0
  const totalCount = data?.networks?.length || 0

  return (
    <div className="relative my-1 w-full max-w-lg sm:max-w-full shadow-md rounded-md p-2">
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)} // 검색창 숨기기
        className="fixed top-30 right-10 bg-gray-200 text-gray-600 p-2 rounded-full hover:bg-gray-300 transition"
      >
        <FiX size={16} /> {/* 닫기 아이콘 */}
      </button>

      {/* Search Results */}
      <div className="flex justify-center items-center mb-4 sm:text-sm">
        <h2 className="text-lg font-bold sm:text-xl text-sm">
          {t("Found")} {totalCount} {t("Results")}
        </h2>
        <button
          onClick={handleClearCache}
          className="ml-1 sm:ml-2 text-red-500 hover:text-red-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v3m0 9v3m7.5-7.5h-3m-9 0H4.5m12.364-5.636l-2.121 2.121m-6.364 6.364L5.636 16.95m12.728 0l-2.121-2.121m-6.364-6.364L5.636 7.05"
            />
          </svg>
        </button>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
        <div className="flex justify-center items-center flex-1 gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-sm text-white rounded disabled:bg-gray-300 sm:px-4 sm:py-2 sm:text-sm px-2 py-1 text-xs"
          >
            {t("Prev")}
          </button>
          <span className="text-sm">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-blue-500 text-sm text-white rounded disabled:bg-gray-300 sm:px-4 sm:py-2 sm:text-sm px-2 py-1 text-xs"
          >
            {t("Next")}
          </button>
        </div>
      </div>
      {!data || !data.networks || data.networks.length === 0 ? (
        <p className="text-center">{t("No search results found.")}</p>
      ) : (
        <ul className="space-y-4 flex flex-col items-center">
          {data?.networks.map((network) => (
            <NetworkItem
              key={network.id}
              {...network}
              setFocusedNode={setFocusedNode}
              handleEntityClick={handleEntityClick}
              handleMigrationTraceClick={handleMigrationTraceClick}
              handleEdgeClick={handleEdgeClick}
              handleNetworkEdgesToggle={handleNetworkEdgesToggle}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchResults
