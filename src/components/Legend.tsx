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
  networkAnalysis, // 네트워크 분석 결과 추가
}: {
  topNetworks: {
    id: number
    name: string
    centrality: number
  }[]
  onEntityClick: (id: number) => void
  centralityType: string
  networkAnalysis: string[] // 네트워크 분석 결과 타입 정의
}) => {
  const map = useMap()
  const { t } = useTranslation()
  useEffect(() => {
    const legend = new L.Control({ position: "topright" })
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend-container")
      div.style.cssText = legendStyles // 스타일 적용
      div.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div style="display: inline-block; width: 15px; height: 15px; background-color: red; border-radius: 50%; margin-right: 5px;"></div>
          <div style="display: flex; align-items: center; margin-left: 5px;">
            <div style="width: 25px; height: 2px; background-color: #8B4513; position: relative;">
              <div style="position: absolute; top: -4px; right: 6px; width: 0; height: 0; border-left: 10px solid #DAA520; border-top: 5px solid transparent; border-bottom: 5px solid transparent;"></div>
            </div>
          </div>
          ${t("migrant")}
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div style="display: inline-block; width: 15px; height: 15px; background-color: blue; border-radius: 50%; margin-right: 5px;"></div>
          <div style="display: flex; align-items: center; margin-left: 5px;">
            <div style="width: 25px; height: 2px; background-color: #8B4513; position: relative;">
              <div style="position: absolute; top: -4px; right: 6px; width: 0; height: 0; border-left: 10px solid #DAA520; border-top: 5px solid transparent; border-bottom: 5px solid transparent;"></div>
            </div>
          </div>
          ${t("organization")}
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div style="display: inline-block; width: 15px; height: 15px; background-color: #FF5722; border: 2px solid #BF360C; border-radius: 50%; margin-right: 5px;"></div>
          <div style="display: flex; align-items: center; margin-left: 5px;">
            <div style="width: 25px; height: 2px; border-top: 3px dashed #8B4513; position: relative;">
              <div style="position: absolute; top: -4px; right: 6px; width: 0; height: 0; border-left: 10px solid red; border-top: 5px solid transparent; border-bottom: 5px solid transparent;"></div>
            </div>
          </div>
          ${t("migrationTrace")}
        </div>
      `
      if (centralityType !== "none") {
        const topEntitiesHtml = topNetworks
          .map(
            (entity, index) =>
              `<div style="cursor: pointer;" data-id="${entity.id}">
              ${index + 1}. ${entity.name}: ${entity.centrality.toFixed(2)}
            </div>`,
          )
          .join("")
        div.innerHTML += `<br><strong>${t("topEntities")}</strong><br>${topEntitiesHtml}`

        // Network Analysis 결과 추가
        const networkAnalysisHtml = networkAnalysis
          .map((result) => `<div>${result}</div>`)
          .join("")
        div.innerHTML += `<br><strong>${t("Network Analysis")}</strong><br>${networkAnalysisHtml}`
      }
      // 클릭 이벤트 직접 연결
      div.addEventListener("click", (event) => {
        const target = event.target as HTMLElement
        const id = target.getAttribute("data-id")
        if (id) {
          onEntityClick(Number(id)) // 클릭된 네트워크로 이동
        }
      })
      return div
    }
    legend.addTo(map)
    return () => {
      legend.remove()
    }
  }, [map, t, topNetworks, centralityType, onEntityClick, networkAnalysis])
}
