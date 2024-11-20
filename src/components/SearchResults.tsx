import { FC, useState, useEffect } from "react"
import { useQuerySearchNetworks } from "../hooks/useQueryNetworks"
import { NetworkItem } from "./NetworkItem"

interface SearchResultsProps {
  searchQuery: string
}

const SearchResults: FC<SearchResultsProps> = ({ searchQuery }) => {
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, error } = useQuerySearchNetworks(
    searchQuery,
    currentPage,
  )

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  useEffect(() => {
    if (data) {
      console.log(data) // data 구조 확인용
    }
  }, [data])

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  const totalPages = data?.totalPages || 0

  return (
    <div className="my-4 w-full max-w-lg">
      {!data || !data.networks || data.networks.length === 0 ? (
        <p className="text-center">No search results found.</p>
      ) : (
        <ul className="space-y-4">
          {data?.networks.map((network) => (
            <NetworkItem key={network.id} {...network} />
          ))}
        </ul>
      )}
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
    </div>
  )
}

export default SearchResults
