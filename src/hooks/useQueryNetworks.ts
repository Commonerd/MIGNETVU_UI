import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { Network } from "../types"
import { useError } from "./useError"

export const useQueryNetworks = () => {
  const { switchErrorHandling } = useError()
  const getNetworks = async () => {
    const { data } = await axios.get<Network[]>(
      `${process.env.REACT_APP_API_URL}/networks`,
      { withCredentials: true },
    )
    return data
  }
  return useQuery<Network[], Error>({
    queryKey: ["networks"],
    queryFn: getNetworks,
    staleTime: Infinity,
    onError: (err: any) => {
      if (err.response.data.message) {
        switchErrorHandling(err.response.data.message)
      } else {
        switchErrorHandling(err.response.data)
      }
    },
  })
}

export const useQueryAllNetworksOnMap = () => {
  const { switchErrorHandling } = useError()
  const getAllNetworksOnMap = async () => {
    const { data } = await axios.get<Network[]>(
      `${process.env.REACT_APP_API_URL}/networks/map`,
      { withCredentials: true },
    )
    // Convert migration_year and end_year to number (year)
    const converted = data.map((network) => ({
      ...network,
      migration_year:
        typeof network.migration_year === "string"
          ? network.migration_year.slice(0, 10)
          : network.migration_year,
      end_year:
        typeof network.end_year === "string"
          ? network.end_year.slice(0, 10)
          : network.end_year,
      edges: Array.isArray(network.edges)
        ? network.edges.map((edge) => ({
            ...edge,
            year:
              edge.year && (edge.year as unknown) instanceof Date
                ? (edge.year as unknown as Date).toISOString().slice(0, 10)
                : typeof edge.year === "string"
                  ? edge.year.slice(0, 10)
                  : edge.year,
          }))
        : network.edges,
      migration_traces: Array.isArray(network.migration_traces)
        ? network.migration_traces.map((trace) => ({
            ...trace,
            migration_year:
              trace.migration_year !== null &&
              trace.migration_year !== undefined &&
              typeof trace.migration_year === "object" &&
              (trace.migration_year as object) instanceof Date
                ? (trace.migration_year as Date).toISOString().slice(0, 10)
                : typeof trace.migration_year === "string"
                  ? trace.migration_year.slice(0, 10)
                  : trace.migration_year,
          }))
        : network.migration_traces,
    }))
    return converted
  }

  return useQuery<Network[], Error>({
    queryKey: ["networks"],
    queryFn: getAllNetworksOnMap,
    staleTime: Infinity,
    onError: (err: any) => {
      if (err.response.data.message) {
        switchErrorHandling(err.response.data.message)
      } else {
        switchErrorHandling(err.response.data)
      }
    },
  })
}

export const useQuerySearchNetworks = (searchQuery: string, page: number) => {
  const { switchErrorHandling } = useError()

  const getSearchNetworks = async () => {
    const { data } = await axios.get<{
      networks: Network[]
      totalPages: number
      totalCount: number
    }>(
      `${process.env.REACT_APP_API_URL}/networks/search`, // 수정된 URL
      {
        params: { searchQuery, page }, // 검색어와 페이지 번호를 쿼리 파라미터로 전달
        withCredentials: true,
      },
    )
    return data
  }

  return useQuery<{ networks: Network[]; totalPages: number }, Error>({
    queryKey: ["searchNetworks", searchQuery, page],
    queryFn: getSearchNetworks,
    staleTime: Infinity,
    onError: (err: any) => {
      if (err.response?.data?.message) {
        switchErrorHandling(err.response.data.message)
      } else {
        switchErrorHandling(err.response.data)
      }
    },
  })
}
