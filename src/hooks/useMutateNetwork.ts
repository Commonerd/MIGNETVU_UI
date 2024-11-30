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
    (network: Omit<Network, "id" | "created_at" | "updated_at">) => {
      const formData = new FormData()
      formData.append("title", network.title)
      formData.append("type", network.type)
      formData.append("nationality", network.nationality)
      formData.append("ethnicity", network.ethnicity)
      formData.append("migration_year", network.migration_year.toString())
      formData.append("end_year", network.end_year.toString())
      formData.append("latitude", network.latitude.toString())
      formData.append("longitude", network.longitude.toString())
      formData.append("connections", JSON.stringify(network.connections))
      formData.append(
        "migration_traces",
        JSON.stringify(network.migration_traces),
      )
      if (network.photo) {
        formData.append("photo", network.photo)
      }

      return axios.post<Network>(
        `${process.env.REACT_APP_API_URL}/networks`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )
    },
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
    (network: Omit<Network, "created_at" | "updated_at">) => {
      const formData = new FormData()
      formData.append("title", network.title)
      formData.append("type", network.type)
      formData.append("nationality", network.nationality)
      formData.append("ethnicity", network.ethnicity)
      formData.append("migration_year", network.migration_year.toString())
      formData.append("end_year", network.end_year.toString())
      formData.append("latitude", network.latitude.toString())
      formData.append("longitude", network.longitude.toString())
      formData.append("connections", JSON.stringify(network.connections))
      formData.append(
        "migration_traces",
        JSON.stringify(network.migration_traces),
      )
      if (network.photo) {
        formData.append("photo", network.photo)
      }

      return axios.put<Network>(
        `${process.env.REACT_APP_API_URL}/networks/${network.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )
    },
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
