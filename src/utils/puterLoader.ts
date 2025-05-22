export function loadPuterScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.puter) {
      resolve()
      return
    }
    // 이미 script가 있으면 resolve
    if (document.querySelector('script[src="https://js.puter.com/v2/"]')) {
      // script가 로드될 때까지 기다림
      const check = () => {
        if (window.puter) resolve()
        else setTimeout(check, 50)
      }
      check()
      return
    }
    const script = document.createElement("script")
    script.src = "https://js.puter.com/v2/"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Puter.js load failed"))
    document.body.appendChild(script)
  })
}
