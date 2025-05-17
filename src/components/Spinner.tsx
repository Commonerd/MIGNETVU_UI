import React from "react"

const Spinner: React.FC<{ progress?: number }> = ({ progress }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "60vh",
      width: "100%",
      zIndex: 9999,
      background: "rgba(255,255,255,0.7)",
      position: "fixed",
      top: 0,
      left: 0,
    }}
  >
    <div className="loader" />
    <div style={{ marginTop: 16, fontSize: 18, color: "#3e2723" }}>
      {progress !== undefined ? `Loading... ${progress}%` : "Loading..."}
    </div>
    <style>
      {`
      .loader {
        border: 8px solid #f3f3f3;
        border-top: 8px solid #3e2723;
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

export default Spinner
