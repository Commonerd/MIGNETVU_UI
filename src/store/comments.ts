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
  ) => Promise<Comment>
  updateComment: (comment: Comment) => Promise<void>
  deleteComment: (id: number) => Promise<void>
}

const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  fetchComments: async (networkId: number) => {
    set({ comments: [] }) // 네트워크 변경 시 초기화
    const comments = await fetchComments(networkId)
    set({ comments })
  },
  createComment: async (comment) => {
    const newComment = await createComment(comment)
    set((state) => ({
      comments: [...(state.comments || []), newComment],
    }))
    return newComment
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
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== id),
    }))
  },
}))

export default useCommentStore
