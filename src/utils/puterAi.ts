// Puter.js가 window.puter로 제공된다고 가정 (브라우저 환경)
// src/utils/puterAi.ts
export async function askGpt(
  messages: { role: string; content: string }[],
  model = "gpt-4o",
) {
  if (typeof window === "undefined" || !(window as any).puter) {
    throw new Error("Puter.js not loaded (client only)")
  }
  const res = await (window as any).puter.ai.chat({ model, messages })
  return res.choices[0].message.content
}

export async function askDalle(prompt: string, model = "dall-e-3") {
  if (!(window as any).puter) throw new Error("Puter.js not loaded")
  const res = await (window as any).puter.ai.image({ prompt, model })
  return res.url
}
