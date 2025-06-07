import axios from "axios"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import useStore from "../store"
import { Credential, LoginResponse } from "../types"
import { useError } from "../hooks/useError"

export const useMutateAuth = () => {
  const router = useRouter()
  const resetEditedTask = useStore((state) => state.resetEditedTask)
  const { switchErrorHandling } = useError()

  const loginMutation = useMutation<LoginResponse, Error, Credential>(
    async (user: Credential) => {
      const response = await axios.post<LoginResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        user,
      )
      return response.data
    },
    {
      onSuccess: () => {
        router.push("/")
      },
      onError: (err: any) => {
        if (err.response && err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling("An error occurred while logging in.")
        }
      },
    },
  )
  const registerMutation = useMutation(
    async (user: Credential) =>
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/signup`, user),
    {
      onError: (err: any) => {
        if (err.response.data.message) {
          switchErrorHandling(err.response.data.message)
        } else {
          switchErrorHandling(err.response.data)
        }
      },
    },
  )
  const logoutMutation = useMutation(
    async () => await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/logout`),
    {
      onSuccess: () => {
        resetEditedTask()
        router.push("/")
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
  return { loginMutation, registerMutation, logoutMutation }
}
