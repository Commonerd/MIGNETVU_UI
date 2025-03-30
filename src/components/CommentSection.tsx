// components/CommentSection.tsx
import React, { useState, useEffect } from "react"
import useCommentStore from "../store/comments"
import { Comment } from "../types"
import useStore from "../store"

const CommentSection: React.FC<CommentSectionProps> = ({ networkId }) => {
  const {
    comments = [], // 초기값을 빈 배열로 설정
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  } = useCommentStore()
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const { user } = useStore() // user 상태 가져오기

  useEffect(() => {
    // 네트워크 ID가 변경될 때 comments를 초기화
    fetchComments(networkId)
  }, [networkId, fetchComments])

  const handleCreateComment = async () => {
    if (newComment.trim()) {
      const commentData = {
        network_id: networkId,
        user_id: user.id,
        user_name: user.name,
        user_role: user.role, // 유저 롤 추가
        content: newComment,
      }
      const createdComment = await createComment(commentData)
      setNewComment("")
      // 새로 생성된 댓글을 comments 상태에 추가
      fetchComments(networkId) // 상태를 다시 가져와 동기화
    }
  }

  const handleUpdateComment = async () => {
    if (editingComment && editingComment.content.trim()) {
      await updateComment(editingComment)
      setEditingComment(null)
      fetchComments(networkId) // 댓글 수정 후 상태 동기화
    }
  }

  const handleDeleteComment = async (id: number) => {
    await deleteComment(id)
    fetchComments(networkId) // 댓글 삭제 후 상태 동기화
  }

  return (
    <div className="w-30 mx-auto bg-gray-100 border border-gray-300 rounded-md p-3">
      <h3 className="text-sm font-semibold mb-2">comments</h3>
      <ul className="space-y-2">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
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
          ))
        ) : (
          <p className="text-xs text-gray-500">No comments yet.</p>
        )}
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
