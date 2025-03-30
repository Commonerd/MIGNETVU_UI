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
    // 네트워크 ID가 변경될 때 comments를 초기화
    set({ comments: [] })
    const comments = await fetchComments(networkId)
    set({ comments })
  },
  createComment: async (comment) => {
    const newComment = await createComment(comment)
    set((state) => ({
      comments: [...(state.comments || []), newComment], // state.comments가 undefined일 경우 빈 배열로 처리
    }))
    return newComment // 새로 생성된 댓글 반환
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
