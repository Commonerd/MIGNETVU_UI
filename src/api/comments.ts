// api/comments.ts
import axios from "axios"
import { Comment } from "../types"

const API_URL = process.env.REACT_APP_API_URL

export const fetchComments = async (networkId: number) => {
  const response = await axios.get<Comment[]>(
    `${API_URL}/comments/network/${networkId}`,
  )
  return response.data
}

export const fetchAllComments = async () => {
  const response = await axios.get<Comment[]>(`${API_URL}/comments`)
  return response.data
}

export const createComment = async (
  comment: Omit<Comment, "id" | "createdAt" | "updatedAt">,
) => {
  console.log("api comment", comment)
  const response = await axios.post<Comment>(`${API_URL}/comments`, comment)
  return response.data
}

export const updateComment = async (comment: Comment) => {
  const response = await axios.put<Comment>(
    `${API_URL}/comments/${comment.id}`,
    comment,
  )
  return response.data
}

export const deleteComment = async (id: number) => {
  await axios.delete(`${API_URL}/comments/${id}`)
}
