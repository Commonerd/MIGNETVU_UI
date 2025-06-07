"use client"
import React, { useState } from "react"
import { askGpt } from "../utils/puterAi"
import { loadPuterScript } from "../utils/puterLoader"

type EdgeInfo = {
  targetId: number
  targetTitle: string
  year: number
  edgeType: string
}

type Props = {
  originId: number // 원점 네트워크 id 추가
  originTitle: string
  migrationPath: { year: number; place: string; reason?: string }[]
  networkSummary: string
  edges?: EdgeInfo[]
}

const AIStorytelling: React.FC<Props> = ({
  originId,
  originTitle,
  migrationPath,
  networkSummary,
  edges,
}) => {
  const [story, setStory] = useState("")
  const [loading, setLoading] = useState(false)

  const handleStoryClick = async () => {
    setLoading(true)
    try {
      await loadPuterScript()
      const prompt = `이 인물의 이주 경로는 다음과 같습니다: ${migrationPath
        .map(
          (p) =>
            `${p.year}년 ${p.place} 이유: ${p.reason || "제시된 정보 없음"}`,
        )
        .join(
          " → ",
        )}. 이 인물의 이주 스토리를 논문에 한 문단(4~5문장)으로 쓸 수 있도록 요약해주고, 마지막에 이동방식의 특징에 대한 인사이트(한 문장)도 추가해줘. 만약에 제시된 정보가 없다면 "제시된 정보가 없다"고 해. 거짓말은 안돼!`
      const result = await askGpt([
        { role: "system", content: "You are a migration story generator." },
        { role: "user", content: prompt },
      ])
      setStory(result)
    } catch (e) {
      alert(
        "AI 기능을 사용할 수 없습니다: " + (e?.message || JSON.stringify(e)),
      )
    }
    setLoading(false)
  }

  const makeNetworkEdgePrompt = (
    edges: EdgeInfo[],
    originId: number,
    originTitle: string,
  ) => {
    if (!edges || edges.length === 0)
      return `네트워크 ${originTitle}(${originId})는 다른 네트워크와 연결된 관계가 없습니다.`
    const edgeLines = edges
      .map(
        (e) =>
          `- ${originTitle}(${originId})와 ${e.targetTitle}(${e.targetId})는 ${e.year}년에 "${e.edgeType}" 관계를 맺음`,
      )
      .join("\n")
    return `${originTitle}(${originId})는 다음과 같은 관계를 맺고 있습니다:\n${edgeLines}\n위 관계들을 바탕으로 논문 한 문단(4~5문장)으로 요약해줘. 그리고 이 네트워크의 특징을 인사이트로 한 문장으로 말해줘. 정보가 없으면 "제시된 정보가 없다"고 해.`
  }

  const handleNetworkStoryClick = async () => {
    setLoading(true)
    try {
      await loadPuterScript()
      const prompt =
        edges && edges.length > 0
          ? makeNetworkEdgePrompt(
              edges,
              originId,
              originTitle || `ID:${originId}`,
            )
          : networkSummary
      const result = await askGpt([
        {
          role: "user",
          content: prompt,
        },
      ])
      setStory(result)
    } catch (e) {
      alert(
        "AI 기능을 사용할 수 없습니다: " + (e?.message || JSON.stringify(e)),
      )
    }
    setLoading(false)
  }

  return (
    <div
      style={{
        margin: "0.5rem 0 0.2rem 0",
        padding: "0.5rem 0.2rem",
        background: "rgba(245,245,245,0.85)",
        borderRadius: "10px",
        boxShadow: "0 1px 6px rgba(33,150,243,0.06)",
        fontSize: "0.93rem",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          marginBottom: "0.5rem",
          justifyContent: "center",
        }}
      >
        <button
          onClick={handleStoryClick}
          disabled={loading}
          style={{
            background: "#e3f2fd",
            border: "none",
            borderRadius: "7px",
            padding: "0.32rem 0.7rem",
            fontWeight: 600,
            fontSize: "0.92rem",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.3em",
            color: "#1976d2",
            boxShadow: "0 1px 3px rgba(33,150,243,0.07)",
            transition: "background 0.2s",
          }}
        >
          <span role="img" aria-label="migration" style={{ fontSize: "1.1em" }}>
            🧳
          </span>
          <span style={{ fontSize: "0.93em" }}>이주 스토리</span>
        </button>
        <button
          onClick={handleNetworkStoryClick}
          disabled={loading}
          style={{
            background: "#fff3e0",
            border: "none",
            borderRadius: "7px",
            padding: "0.32rem 0.7rem",
            fontWeight: 600,
            fontSize: "0.92rem",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.3em",
            color: "#e65100",
            boxShadow: "0 1px 3px rgba(255,152,0,0.07)",
            transition: "background 0.2s",
          }}
        >
          <span role="img" aria-label="network" style={{ fontSize: "1.1em" }}>
            🕸️
          </span>
          <span style={{ fontSize: "0.93em" }}>관계망 스토리</span>
        </button>
      </div>

      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5em",
            margin: "0.7rem 0 0.2rem 0",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              border: "2.5px solid #90caf9",
              borderTop: "2.5px solid #fff",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 1s linear infinite",
            }}
          />
          <span
            style={{ fontWeight: 500, color: "#1976d2", fontSize: "0.93em" }}
          >
            HistoryBot 생성 중...
          </span>
          <style>
            {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      )}

      {story && (
        <div
          style={{
            background: "#f8f9fa",
            borderRadius: "8px",
            boxShadow: "0 1px 6px rgba(33,150,243,0.06)",
            padding: "0.7rem 0.7rem 0.7rem 0.9rem",
            margin: "0.5rem 0 0 0",
            fontSize: "0.97em",
            color: "#333",
            lineHeight: 1.6,
            border: "1px solid #e3e3e3",
            position: "relative",
            minHeight: "2.2em",
            wordBreak: "keep-all",
            whiteSpace: "pre-line",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 16,
              fontSize: "1.1em",
              opacity: 0.13,
              pointerEvents: "none",
            }}
            aria-hidden
          >
            ✨
          </span>
          <div
            style={{
              fontWeight: 700,
              marginBottom: "0.3em",
              color: "#1976d2",
              display: "flex",
              alignItems: "center",
              gap: "0.3em",
              fontSize: "0.98em",
            }}
          >
            <span role="img" aria-label="story" style={{ fontSize: "1.1em" }}>
              🤖📚
            </span>
            HistoryBot 스토리 결과
          </div>
          <div style={{ fontSize: "0.97em", color: "#222" }}>{story}</div>
        </div>
      )}
    </div>
  )
}

export default AIStorytelling
