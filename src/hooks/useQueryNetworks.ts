import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { Network } from "../types"
import { useError } from "./useError"

export const useQueryNetworks = () => {
  const { switchErrorHandling } = useError()
  const getNetworks = async () => {
    const { data } = await axios.get<Network[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/networks`,
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
      `${process.env.NEXT_PUBLIC_API_URL}/networks/map`,
      { withCredentials: true }, // No credentials needed since it's fetching all networks
    )
    return data
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
      `${process.env.NEXT_PUBLIC_API_URL}/networks/search`, // 수정된 URL
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
