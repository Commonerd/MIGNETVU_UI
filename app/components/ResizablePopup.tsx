import React, { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { FiX } from "react-icons/fi"
import styled from "styled-components"

const ResizablePopup = ({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) => {
  const [popupStyle, setPopupStyle] = useState({
    width: 380,
    height: 850,
    top: (window.innerHeight - 850) / 2, // 화면 중앙에 위치
    left: (window.innerWidth - 380) / 2, // 화면 중앙에 위치
  })

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null,
  )

  // 화면 크기 변경 시 팝업 위치 조정
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setPopupStyle({
          width: window.innerWidth * 0.9, // 모바일에서는 화면 너비의 90%
          height: window.innerHeight * 0.8, // 모바일에서는 화면 높이의 80%
          top: (window.innerHeight * 0.1) / 2, // 화면 중앙에 위치
          left: (window.innerWidth * 0.1) / 2, // 화면 중앙에 위치
        })
      } else {
        setPopupStyle({
          width: 380, // 데스크톱 기본 너비
          height: 850, // 데스크톱 기본 높이
          top: (window.innerHeight - 850) / 2, // 화면 중앙에 위치
          left: (window.innerWidth - 380) / 2, // 화면 중앙에 위치
        })
      }
    }

    handleResize() // 초기 실행
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - popupStyle.left,
      y: e.clientY - popupStyle.top,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragStart) {
      const newLeft = e.clientX - dragStart.x
      const newTop = e.clientY - dragStart.y

      setPopupStyle((prev) => ({
        ...prev,
        top: newTop,
        left: newLeft,
      }))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    } else {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const handleResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const startWidth = popupStyle.width
    const startHeight = popupStyle.height
    const startX = e.clientX
    const startY = e.clientY

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX)
      const newHeight = startHeight + (moveEvent.clientY - startY)
      setPopupStyle((prev) => ({
        ...prev,
        width: Math.max(newWidth, 150), // 최소 너비
        height: Math.max(newHeight, 100), // 최소 높이
      }))
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const handleDoubleClickResize = () => {
    // 최적화된 크기로 변경
    setPopupStyle((prev) => ({
      ...prev,
      width: 380, // 최적화된 너비
      height: 425, // 최적화된 높이
    }))
  }

  return ReactDOM.createPortal(
    <PopupContainer
      style={{
        width: popupStyle.width,
        height: popupStyle.height,
        top: popupStyle.top,
        left: popupStyle.left,
      }}
    >
      <PopupHeader onMouseDown={handleMouseDown}>
        <button onClick={onClose}>
          <FiX />
        </button>
      </PopupHeader>
      <PopupContent>{children}</PopupContent>
      <ResizeHandle
        onMouseDown={handleResize}
        onDoubleClick={handleDoubleClickResize} // 더블클릭 이벤트 추가
      />
    </PopupContainer>,
    document.body,
  )
}

const PopupContainer = styled.div`
  position: absolute;
  background: rgba(241, 245, 249, 0.3); /* 약간의 투명도 추가 */
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 2000;
`

const PopupHeader = styled.div`
  background: rgba(30, 58, 138, 0.7); /* 약간의 투명도 추가 */
  padding: 8px;
  display: flex;
  justify-content: flex-end;
  border-bottom: 1px solid #ccc;
  cursor: grab; /* 드래그 가능 표시 */

  button {
    background: rgba(128, 0, 32, 0.8); /* 약간의 투명도 추가 */
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: rgba(165, 42, 42, 0.8); /* 약간의 투명도 추가 */
    }
  }
`

const PopupContent = styled.div`
  background: rgba(241, 245, 249, 0.6); /* 약간의 투명도 추가 */
  overflow: auto;
  height: calc(100%); /* 헤더 높이를 제외한 영역 */
`

const ResizeHandle = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 16px;
  background: rgba(204, 204, 204, 0.6); /* 약간의 투명도 추가 */
  cursor: se-resize;
`

export default ResizablePopup
