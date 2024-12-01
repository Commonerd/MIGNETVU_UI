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
    (formData: FormData) => {
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
    ({ id, formData }: { id: number; formData: FormData }) => {
      return axios.put<Network>(
        `${process.env.REACT_APP_API_URL}/networks/${id}`,
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
