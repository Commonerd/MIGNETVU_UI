// store/comments.ts
import { create } from "zustand"
import { Comment } from "../types"
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from "../api/comments"

interface CommentState {
  comments: Comment[]
  fetchComments: (networkId: number) => Promise<void>
  createComment: (
    comment: Omit<Comment, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>
  updateComment: (comment: Comment) => Promise<void>
  deleteComment: (id: number) => Promise<void>
}

const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  fetchComments: async (networkId: number) => {
    const comments = await fetchComments(networkId)
    set({ comments })
  },
  createComment: async (comment) => {
    console.log("store comment", comment)
    const newComment = await createComment(comment)
    set((state) => ({ comments: [...state.comments, newComment] }))
  },
  updateComment: async (comment) => {
    const updatedComment = await updateComment(comment)
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === updatedComment.id ? updatedComment : c,
      ),
    }))
  },
  deleteComment: async (id) => {
    await deleteComment(id)
    set((state) => ({ comments: state.comments.filter((c) => c.id !== id) }))
  },
}))

export default useCommentStore
