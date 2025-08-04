// Puter.js가 window.puter로 제공된다고 가정 (브라우저 환경)
// src/utils/puterAi.ts
let puter: any = null

// 타입스크립트에서 window.Puter 타입 선언 (선택)
declare global {
  interface Window {
    puter: any
  }
}
function getPuter() {
  if (typeof window === "undefined" || !window.puter) {
    throw new Error("Puter.js v2 not loaded (client only)")
  }
  return window.puter // 생성자 호출(X), 그냥 객체 반환(O)
}

export async function askGpt(
  messages: { role: string; content: string }[],
  model = "gpt-4o",
) {
  const puter = getPuter()
  // messages가 배열인지 확인
  if (!Array.isArray(messages)) {
    throw new Error("messages must be an array")
  }
  const res = await puter.ai.chat(messages, false, { model })
  if (res?.message?.content) {
    return res.message.content
  }
}

export async function askDalle(prompt: string, model = "dall-e-3") {
  const puter = getPuter()
  const res = await puter.ai.image({ prompt, model })
  return res.url
}
