// components/CommentSection.tsx
import React, { useState, useEffect } from "react"
import useCommentStore from "../store/comments"
import { Comment } from "../types"
import useStore from "../store"

interface CommentSectionProps {
  networkId: number
}

const CommentSection: React.FC<CommentSectionProps> = ({ networkId }) => {
  const {
    comments,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  } = useCommentStore()
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const { user } = useStore() // user 상태 가져오기

  useEffect(() => {
    fetchComments(networkId)
  }, [networkId, fetchComments])

  const handleCreateComment = async () => {
    if (newComment.trim()) {
      await createComment({
        network_id: networkId,
        user_id: user.id,
        user_name: user.name,
        content: newComment,
      })
      setNewComment("")
    }
  }

  const handleUpdateComment = async () => {
    if (editingComment && editingComment.content.trim()) {
      await updateComment(editingComment)
      setEditingComment(null)
    }
  }

  const handleDeleteComment = async (id: number) => {
    await deleteComment(id)
  }

  return (
    <div className="w-30 mx-auto bg-gray-100 border border-gray-300 rounded-md p-3">
      <h3 className="text-sm font-semibold mb-2">comments</h3>
      <ul className="space-y-2">
        {comments.map((comment) => (
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
              <p className="text-xs text-gray-800 overflow-y-auto">
                <strong className="font-semibold">
                  {comment.user_name}({comment.user_role})
                </strong>
                : {comment.content}
              </p>
            )}
            {comment.user_id === user.id && (
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
        ))}
      </ul>
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
    </div>
  )
}

export default CommentSection
