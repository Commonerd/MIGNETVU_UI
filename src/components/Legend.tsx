import L from "leaflet"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMap } from "react-leaflet"

// Legend Component
export const legendStyles = `
  background-color: rgba(255, 255, 255, 0.7);
  padding: 7px;
  top: 0;
  right: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-size: 0.7rem;
  max-width: 10rem;
  overflow-y: auto;
  h2 {
    font-size: 1rem;
    margin-bottom: 0.3rem;
    text-align: center;
    font-weight: bold;
  }
  div {
    font-size: 0.8rem;
    margin-bottom: 0.2rem;
  }
  @media (max-width: 768px) {
    font-size: 0.7rem;
    max-width: 8rem;
    h2 {
      font-size: 0.9rem;
    }
    div {
      font-size: 0.8rem;
    }
  }
  @media (max-width: 480px) {
    font-size: 0.4rem;
    max-width: 7rem;
    h2 {
      font-size: 0.7rem;
    }
    div {
      font-size: 0.7rem;
    }
  }
`
export const Legend = ({
  topNetworks,
  onEntityClick,
  centralityType,
  networkAnalysis,
  showRelationsOnly,
  showMigrationsOnly,
  onToggleRelationsOnly,
  onToggleMigrationsOnly,
}: {
  topNetworks: {
    id: number
    name: string
    centrality: number
  }[]
  onEntityClick: (id: number) => void
  centralityType: string
  networkAnalysis: string[]
  showRelationsOnly: boolean
  showMigrationsOnly: boolean
  onToggleRelationsOnly: () => void
  onToggleMigrationsOnly: () => void
}) => {
  const map = useMap()
  const { t } = useTranslation()
  // 범례 UI 직접 렌더링 (Leaflet Control 대신 React)
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: "1rem",
        zIndex: 1200,
        background: "rgba(255,255,255,0.85)",
        borderRadius: "0.5rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        padding: 10,
        maxWidth: 200,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
        <div
          style={{
            width: 28,
            height: 0,
            borderTop: "4px dashed #ff9800",
            margin: "0 8px",
            verticalAlign: "middle",
          }}
        />
        <span style={{ color: "#e65100", fontWeight: 600 }}>
          {t("Connections")}
        </span>
        <button
          onClick={onToggleRelationsOnly}
          style={{
            marginLeft: 8,
            background: showRelationsOnly ? "#ff9800" : "#fff3e0",
            color: showRelationsOnly ? "#fff" : "#e65100",
            border: showRelationsOnly
              ? "2px solid #e65100"
              : "1.5px solid #ffe0b2",
            borderRadius: 4,
            padding: "0.2rem 0.8rem",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.2s, color 0.2s, border 0.2s",
          }}
        >
          {showRelationsOnly ? t("Show") : t("Show")}
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
        <div
          style={{
            width: 28,
            height: 0,
            borderTop: "4px dashed #1976d2",
            margin: "0 8px",
            verticalAlign: "middle",
          }}
        />
        <span style={{ color: "#1976d2", fontWeight: 600 }}>
          {t("Mobility")}
        </span>
        <button
          onClick={onToggleMigrationsOnly}
          style={{
            marginLeft: 8,
            background: showMigrationsOnly ? "#1976d2" : "#e3f2fd",
            color: showMigrationsOnly ? "#fff" : "#1976d2",
            border: showMigrationsOnly
              ? "2px solid #1976d2"
              : "1.5px solid #bbdefb",
            borderRadius: 4,
            padding: "0.2rem 0.8rem",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.2s, color 0.2s, border 0.2s",
          }}
        >
          {showMigrationsOnly ? t("Show") : t("Show")}
        </button>
      </div>
      {centralityType !== "none" && (
        <>
          <br />
          <strong>{t("topEntities")}</strong>
          <br />
          {topNetworks.map((entity, index) => (
            <div
              key={entity.id}
              style={{ cursor: "pointer" }}
              data-id={entity.id}
              onClick={() => onEntityClick(entity.id)}
            >
              {index + 1}. {entity.name}: {entity.centrality.toFixed(2)}
            </div>
          ))}
          <br />
          <strong>{t("Analysis Results")}</strong>
          <br />
          {networkAnalysis.map((result, i) => (
            <div key={i}>{result}</div>
          ))}
        </>
      )}
    </div>
  )
}
