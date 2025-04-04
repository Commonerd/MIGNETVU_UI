import { useMap } from "react-leaflet"
import { useEffect } from "react"
import L from "leaflet"

const MigrationTraceDecorator = ({ traces }: { traces: any[] }) => {
  const map = useMap()

  useEffect(() => {
    if (!traces || traces.length < 2) return

    const decorators: L.LayerGroup = L.layerGroup()

    traces.slice(0, -1).forEach((trace, index) => {
      const nextTrace = traces[index + 1]

      // 데이터 검증
      if (
        !trace ||
        !nextTrace ||
        !trace.latitude ||
        !trace.longitude ||
        !nextTrace.latitude ||
        !nextTrace.longitude
      ) {
        console.warn("Invalid trace data:", { trace, nextTrace })
        return
      }

      // Polyline 생성
      const polyline = L.polyline(
        [
          [trace.latitude, trace.longitude],
          [nextTrace.latitude, nextTrace.longitude],
        ],
        {
          color: "#795548",
          weight: 3,
          opacity: 0.8,
          dashArray: "5, 5",
        },
      )

      // PolylineDecorator 추가
      const decorator = L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: "50%", // 화살표가 선의 중간에 위치
            repeat: 0, // 화살표를 한 번만 표시
            symbol: L.Symbol.arrowHead({
              pixelSize: 20,
              polygon: true,
              headAngle: 45,
              pathOptions: {
                fillOpacity: 1,
                weight: 0,
                color: "#FF9800",
              },
            }),
          },
        ],
      })

      decorators.addLayer(polyline)
      decorators.addLayer(decorator)
    })

    // 지도에 추가
    decorators.addTo(map)

    // 컴포넌트 언마운트 시 제거
    return () => {
      decorators.clearLayers()
      map.removeLayer(decorators)
    }
  }, [map, traces])

  return null
}

export default MigrationTraceDecorator
