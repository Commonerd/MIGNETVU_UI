import { useMap } from "react-leaflet"
import { useEffect, useRef } from "react"
import L from "leaflet"

const MigrationTraceDecorator = ({ traces }: { traces: any[] }) => {
  const map = useMap()
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!traces || traces.length < 2) return

    const decorators: L.LayerGroup = L.layerGroup()
    const animatedPolylines: { polyline: L.Polyline; dashDecorator: any }[] = []

    traces.slice(0, -1).forEach((trace, index) => {
      const nextTrace = traces[index + 1]

      // 같은 네트워크 ID인지 확인
      if (trace.network_id !== nextTrace.network_id) return

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

      // 점선 애니메이션을 위한 PolylineDecorator
      const dashDecorator = L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: "0%", // 초기 offset 값
            repeat: "10%", // 점선 간격
            symbol: L.Symbol.dash({
              pixelSize: 10,
              pathOptions: { color: "#FF9800", weight: 2 },
            }),
          },
        ],
      })

      // 화살표를 위한 PolylineDecorator
      const arrowDecorator = L.polylineDecorator(polyline, {
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
      decorators.addLayer(dashDecorator)
      decorators.addLayer(arrowDecorator)

      animatedPolylines.push({ polyline, dashDecorator })
    })

    // 지도에 추가
    decorators.addTo(map)

    // 애니메이션 함수
    let offset = 0
    const animate = () => {
      offset = (offset + 0.5) % 100 // 애니메이션 속도를 천천히 (기존 1에서 0.2로 변경)
      animatedPolylines.forEach(({ dashDecorator }) => {
        dashDecorator.setPatterns([
          {
            offset: `${offset}%`,
            repeat: "10%",
            symbol: L.Symbol.dash({
              pixelSize: 10,
              pathOptions: { color: "#FF9800", weight: 2 },
            }),
          },
        ])
      })
      animationRef.current = requestAnimationFrame(animate)
    }

    // 애니메이션 시작
    animate()

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      decorators.clearLayers()
      map.removeLayer(decorators)
    }
  }, [map, traces])

  return null
}

export default MigrationTraceDecorator
