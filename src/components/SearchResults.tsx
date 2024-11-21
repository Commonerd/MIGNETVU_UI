import { FC, useState, useEffect } from "react"
import { useQuerySearchNetworks } from "../hooks/useQueryNetworks"
import { NetworkItem } from "./NetworkItem"
import { useQueryClient } from "@tanstack/react-query"

interface SearchResultsProps {
  searchQuery: string
}

const SearchResults: FC<SearchResultsProps> = ({ searchQuery }) => {
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

  return (
    <div className="my-4 w-full max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Search Results</h2>
        <button
          onClick={handleClearCache}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Clear Cache
        </button>
      </div>{" "}
      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Prev
        </button>
        <span className="px-4 py-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
      {!data || !data.networks || data.networks.length === 0 ? (
        <p className="text-center">No search results found.</p>
      ) : (
        <ul className="space-y-4">
          {data?.networks.map((network) => (
            <NetworkItem key={network.id} {...network} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchResults
