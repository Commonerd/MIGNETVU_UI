import React from "react"

const Spinner: React.FC<{ progress?: number }> = ({ progress }) => {
  console.log("SPINNER RENDERED", progress)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh", // 전체 화면 덮기
        width: "100vw", // 수정!
        zIndex: 99999, // zIndex를 충분히 높임
        background: "rgba(255,255,255,0.7)",
        position: "absolute", // fixed → absolute
        top: 0,
        left: 0,
      }}
    >
      <div className="loader" />
      <div style={{ marginTop: 16, fontSize: 18, color: "#3e2723" }}>
        {/* {progress !== undefined ? `Loading... ${progress}%` : "Loading..."} */}
        {progress !== undefined ? `Loading...` : "Loading..."}
      </div>
      <style>
        {`
      .loader {
        border: 8px solid #f3f3f3;
        border-top: 8px solidrgb(62, 35, 41);
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
      }
      `}
      </style>
    </div>
  )
}
export default Spinner
