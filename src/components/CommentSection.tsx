import React, { useState, useEffect } from "react"
import useCommentStore from "../store/comments"
import { Comment } from "../types"
import useStore from "../store"

const CommentSection: React.FC<CommentSectionProps> = ({ networkId }) => {
  const {
    comments,
    currentNetworkId,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  } = useCommentStore()
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const { user } = useStore()

  useEffect(() => {
    if (currentNetworkId !== networkId) {
      fetchComments(networkId)
    }
  }, [networkId, comments, currentNetworkId, fetchComments])

  const handleCreateComment = async () => {
    if (newComment.trim()) {
      const commentData = {
        network_id: networkId,
        user_id: user?.id || null, // 로그인하지 않은 경우 user_id를 null로 설정
        user_name: user?.name || "Guest", // 로그인하지 않은 경우 기본 이름 설정
        user_role: user?.role || "Guest", // 로그인하지 않은 경우 기본 역할 설정
        content: newComment,
      }
      await createComment(networkId, commentData)
      setNewComment("")
    }
  }

  const handleUpdateComment = async () => {
    if (editingComment && editingComment.content.trim()) {
      await updateComment(networkId, editingComment)
      setEditingComment(null)
    }
  }

  const handleDeleteComment = async (id: number) => {
    if (user) {
      await deleteComment(networkId, id)
    }
  }

  return (
    <div className="w-30 mx-auto bg-gray-100 border border-gray-300 rounded-md p-3">
      <h3 className="text-sm font-semibold mb-2">comments</h3>
      <ul className="space-y-2">
        {comments[networkId] && comments[networkId].length > 0 ? (
          comments[networkId].map((comment) => (
            <li
              key={comment.id}
              className="flex flex-col bg-white p-2 border border-gray-200 rounded overflow-y-auto"
            >
              {editingComment?.id === comment.id ? (
                <input
                  type="text"
                  value={editingComment.content}
                  onChange={(e) =>
                    setEditingComment({
                      ...editingComment,
                      content: e.target.value,
                    })
                  }
                  className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs"
                />
              ) : (
                <div className="text-xs text-gray-800 overflow-y-auto">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {comment.user_name}
                    </span>
                    <span className="text-gray-500">({comment.user_role})</span>
                    <span className="text-gray-400 text-[11px]">
                      {comment.created_at instanceof Date
                        ? comment.created_at
                            .toISOString()
                            .split("T")[0]
                            .replace(/-/g, "/")
                        : new Date(comment.created_at)
                            .toISOString()
                            .split("T")[0]
                            .replace(/-/g, "/")}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700">{comment.content}</p>
                </div>
              )}
              {user && comment.user_id === user.id && (
                <div className="flex justify-end space-x-1 mt-1">
                  {editingComment?.id === comment.id ? (
                    <button
                      onClick={handleUpdateComment}
                      className="px-2 py-0.5 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingComment(comment)}
                      className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="px-2 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))
        ) : (
          <p className="text-xs text-gray-500">No comments yet.</p>
        )}
      </ul>
      {user && (
        <div className="flex flex-col mt-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="add comments"
            className="flex-1 p-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={handleCreateComment}
            className="px-3 py-1 mt-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            add
          </button>
        </div>
      )}
    </div>
  )
}

export default CommentSection
