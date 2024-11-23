import axios from "axios"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { Network } from "../types"
import useStore from "../store"
import { useError } from "../hooks/useError"

export const useMutateNetwork = () => {
  const queryClient = useQueryClient()
  const { switchErrorHandling } = useError()
  const resetEditedNetwork = useStore((state) => state.resetEditedNetwork)

  const createNetworkMutation = useMutation(
    (network: Omit<Network, "id" | "created_at" | "updated_at">) =>
      axios.post<Network>(`${process.env.REACT_APP_API_URL}/networks`, {
        title: network.title,
        type: network.type,
        nationality: network.nationality,
        ethnicity: network.ethnicity,
        migration_year: network.migration_year,
        latitude: network.latitude,
        longitude: network.longitude,
        connections: network.connections, // Include connections in the request
        migration_traces: network.migration_traces,
      }),
    {
      onSuccess: (res) => {
        const previousNetworks = queryClient.getQueryData<Network[]>([
          "networks",
        ])
        if (previousNetworks) {
          queryClient.setQueryData(
            ["networks"],
            [...previousNetworks, res.data],
          )
        }
        resetEditedNetwork()
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    },
  )

  const updateNetworkMutation = useMutation(
    (network: Omit<Network, "created_at" | "updated_at">) =>
      axios.put<Network>(
        `${process.env.REACT_APP_API_URL}/networks/${network.id}`,
        {
          title: network.title,
          type: network.type,
          nationality: network.nationality,
          ethnicity: network.ethnicity,
          migration_year: network.migration_year,
          latitude: network.latitude,
          longitude: network.longitude,
          connections: network.connections, // Include connections in the request
          migration_traces: network.migration_traces,
        },
      ),
    {
      onSuccess: (res, variables) => {
        const previousNetworks = queryClient.getQueryData<Network[]>([
          "networks",
        ])
        if (previousNetworks) {
          queryClient.setQueryData<Network[]>(
            ["networks"],
            previousNetworks.map((network) =>
              network.id === variables.id ? res.data : network,
            ),
          )
        }
        resetEditedNetwork()
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    },
  )

  const deleteNetworkMutation = useMutation(
    (id: number) =>
      axios.delete(`${process.env.REACT_APP_API_URL}/networks/${id}`),
    {
      onSuccess: (_, variables) => {
        const previousNetworks = queryClient.getQueryData<Network[]>([
          "networks",
        ])
        if (previousNetworks) {
          queryClient.setQueryData<Network[]>(
            ["networks"],
            previousNetworks.filter((network) => network.id !== variables),
          )
        }
        resetEditedNetwork()
      },
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    },
  )

  return {
    createNetworkMutation,
    updateNetworkMutation,
    deleteNetworkMutation,
  }
}
