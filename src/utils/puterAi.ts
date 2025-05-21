// Puter.js가 window.puter로 제공된다고 가정 (브라우저 환경)
// src/utils/puterAi.ts
let puter: any = null

// 타입스크립트에서 window.Puter 타입 선언 (선택)
declare global {
  interface Window {
    Puter: any
  }
}
function getPuter() {
  if (typeof window === "undefined" || !window.Puter) {
    throw new Error("Puter.js v2 not loaded (client only)")
  }
  if (!puter) puter = new window.Puter()
  return puter
}

export async function askGpt(
  messages: { role: string; content: string }[],
  model = "gpt-4o",
) {
  const puter = getPuter()
  const res = await puter.ai.chat({ model, messages })
  return res.choices[0].message.content
}

export async function askDalle(prompt: string, model = "dall-e-3") {
  const puter = getPuter()
  const res = await puter.ai.image({ prompt, model })
  return res.url
}
