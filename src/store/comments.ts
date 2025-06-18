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
  comments: { [networkId: number]: Comment[] }
  currentNetworkId: number | null
  fetchComments: (networkId: number) => Promise<void>
  createComment: (
    networkId: number,
    comment: Omit<Comment, "id" | "created_at" | "updated_at">,
  ) => Promise<Comment>
  updateComment: (networkId: number, comment: Comment) => Promise<void>
  deleteComment: (networkId: number, id: number) => Promise<void>
}

const useCommentStore = create<CommentState>((set, get) => ({
  comments: {},
  currentNetworkId: null,
  fetchComments: async (networkId: number) => {
    const comments = await fetchComments(networkId)
    set((state) => ({
      comments: { ...state.comments, [networkId]: comments },
      currentNetworkId: networkId,
    }))
  },
  createComment: async (networkId, comment) => {
    const newComment = await createComment(comment)
    set((state) => ({
      comments: {
        ...state.comments,
        [networkId]: [...(state.comments[networkId] || []), newComment],
      },
    }))
    return newComment
  },
  updateComment: async (networkId, comment) => {
    const updatedComment = await updateComment(comment)
    set((state) => ({
      comments: {
        ...state.comments,
        [networkId]: state.comments[networkId].map((c) =>
          c.id === updatedComment.id ? updatedComment : c,
        ),
      },
    }))
  },
  deleteComment: async (networkId, id) => {
    await deleteComment(id)
    set((state) => ({
      comments: {
        ...state.comments,
        [networkId]: state.comments[networkId].filter((c) => c.id !== id),
      },
    }))
  },
}))

export default useCommentStore
