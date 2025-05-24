import { useState, useEffect } from "react"
import axios from "axios"
import { useMutation } from "@tanstack/react-query"
import { useError } from "./useError"
import { CsrfToken, ProfileUpdateData, ProfileUpdateResponse } from "../types"

export const useMutateProfile = () => {
  const { switchErrorHandling } = useError()
  const [csrfLoaded, setCsrfLoaded] = useState(false)

  // useEffect(() => {
  //   const getCsrfToken = async () => {
  //     try {
  //       const { data } = await axios.get<CsrfToken>(
  //         `${process.env.REACT_APP_API_URL}/csrf`,
  //       )
  //       axios.defaults.headers.common["X-CSRF-Token"] = data.csrf_token
  //       setCsrfLoaded(true)
  //     } catch (err) {
  //       switchErrorHandling("Failed to load CSRF token. Please try again.")
  //     }
  //   }
  //   axios.defaults.withCredentials = true
  //   getCsrfToken()
  // }, [])

  const updateProfileMutation = useMutation(
    (profileData: ProfileUpdateData) =>
      axios.put(
        `${process.env.REACT_APP_API_URL}/user/update-profile`,
        profileData,
      ),
    {
      onError: (err: any) => {
        switchErrorHandling(
          err.response?.data?.message || "Failed to update profile.",
        )
      },
    },
  )

  return { csrfLoaded, updateProfileMutation }
}
