import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Network } from '../types'
import { useError } from './useError'

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
    queryKey: ['networks'],
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
