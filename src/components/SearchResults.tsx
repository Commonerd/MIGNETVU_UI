import { FC, useState, useEffect } from "react"
import { useQuerySearchNetworks } from "../hooks/useQueryNetworks"
import { NetworkItem } from "./NetworkItem"
import { useQueryClient } from "@tanstack/react-query"
import { useMap } from "react-leaflet"

interface SearchResultsProps {
  searchQuery: string
  setFocusedNode: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >
  handleEntityClick: (id: number) => void
  handleMigrationTraceClick: (networkId: number) => void // 추가
  handleEdgeClick: (edgeId: number) => void // 추가
  handleNetworkEdgesToggle: (networkId: number) => void // 추가
}

const SearchResults: FC<SearchResultsProps> = ({
  searchQuery,
  setFocusedNode,
  handleEntityClick,
  handleMigrationTraceClick,
  handleEdgeClick, // 추가
  handleNetworkEdgesToggle, // 추가
}) => {
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, error } = useQuerySearchNetworks(
    searchQuery,
    currentPage,
  )

  const queryClient = useQueryClient() // React Query Client 접근

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }
  const handleClearCache = () => {
    // 특정 쿼리 키 캐시 삭제
    queryClient.invalidateQueries({ queryKey: ["searchNetworks"] })
    alert("Cache has been cleared!") // 영어 메시지
  }

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  const totalPages = data?.totalPages || 0
  const totalCount = data?.totalCount || 0

  return (
    <div className="my-1 w-full max-w-lg sm:max-w-full">
      {/* Search Results */}
      <div className="flex justify-center items-center mb-4 sm:text-sm">
        <h2 className="text-lg font-bold sm:text-xl text-sm">
          Found {totalCount} Results
        </h2>
        {/* Clear Cache Icon */}
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
        {/* Pagination Centered */}
        <div className="flex justify-center items-center flex-1 gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-sm text-white rounded disabled:bg-gray-300 sm:px-4 sm:py-2 sm:text-sm px-2 py-1 text-xs"
          >
            Prev
          </button>
          <span className="text-sm">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-blue-500 text-sm text-white rounded disabled:bg-gray-300 sm:px-4 sm:py-2 sm:text-sm px-2 py-1 text-xs"
          >
            Next
          </button>
        </div>
      </div>
      {!data || !data.networks || data.networks.length === 0 ? (
        <p className="text-center">No search results found.</p>
      ) : (
        <ul className="space-y-4">
          {data?.networks.map((network) => (
            <NetworkItem
              key={network.id}
              {...network}
              setFocusedNode={setFocusedNode}
              handleEntityClick={handleEntityClick}
              handleMigrationTraceClick={handleMigrationTraceClick} // 추가
              handleEdgeClick={handleEdgeClick} // 추가
              handleNetworkEdgesToggle={handleNetworkEdgesToggle} // 추가
            />
          ))}
        </ul>
      )}
    </div>
  )
}