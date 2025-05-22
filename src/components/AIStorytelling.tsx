import React, { useState } from "react"
import { askGpt, askDalle } from "../utils/puterAi"
import { loadPuterScript } from "../utils/puterLoader"

type Props = {
  migrationPath: { year: number; place: string }[]
  networkSummary: string
}

const AIStorytelling: React.FC<Props> = ({ migrationPath, networkSummary }) => {
  const [story, setStory] = useState("")
  const [imgUrl, setImgUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = async () => {
    try {
      const puter = new (window as any).Puter()
      await puter.auth.login()
      setIsLoggedIn(true)
    } catch (e) {
      alert("로그인 실패: " + e)
    }
  }

  const handleStoryClick = async () => {
    setLoading(true)
    try {
      await loadPuterScript() // Puter.js가 로드될 때까지 기다림
      const prompt = `이 인물의 이주 경로는 다음과 같습니다: ${migrationPath.map((p) => `${p.year}년 ${p.place}`).join(" → ")}. 이 인물의 이주 스토리를 3문장으로 요약해줘.`
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

  const handleNetworkStoryClick = async () => {
    setLoading(true)
    const result = await askGpt([
      { role: "system", content: "You are a network story summarizer." },
      { role: "user", content: networkSummary },
    ])
    setStory(result)
    setLoading(false)
  }

  const handleImageClick = async () => {
    setLoading(true)
    const prompt = `${migrationPath
      .map((p) => `${p.year}년 ${p.place}`)
      .join(" → ")} 이주 여정을 상징적으로 표현한 지도 일러스트`
    const url = await askDalle(prompt)
    setImgUrl(url)
    setLoading(false)
  }

  return (
    <div style={{ margin: "1rem 0" }}>
      <button onClick={handleStoryClick} disabled={loading}>
        인물 이주 스토리 생성
      </button>
      <button onClick={handleNetworkStoryClick} disabled={loading}>
        네트워크 관계망 스토리 생성
      </button>
      {/* <button onClick={handleImageClick} disabled={loading}>
            DALL·E 이주 경로 이미지 생성
          </button> */}

      {loading && <div>AI 생성 중...</div>}
      {story && (
        <div style={{ margin: "1rem 0", whiteSpace: "pre-line" }}>{story}</div>
      )}
      {imgUrl && (
        <div>
          <img src={imgUrl} alt="AI Generated" style={{ maxWidth: 320 }} />
        </div>
      )}
    </div>
  )
}

export default AIStorytelling
