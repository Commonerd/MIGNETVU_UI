import { useMap } from "react-leaflet"

import { useEffect, useRef } from "react"

import L from "leaflet"

const MigrationTraceDecorator = ({ traces }: { traces: any[] }) => {
  const map = useMap()

  const animationRef = useRef<number | null>(null)
  // Canvas Renderer 생성
  const canvasRenderer = L.canvas()

  useEffect(() => {
    if (!traces || traces.length < 2) return

    const decorators: L.LayerGroup = L.layerGroup()

    const animatedPolylines: { polyline: L.Polyline; decorator: any }[] = []

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
          renderer: canvasRenderer, // Canvas Renderer 적용
        },
      )

      // PolylineDecorator 추가

      const decorator = L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: "50%", // 화살표가 선의 중간에 위치

            repeat: 0, // 화살표를 한 번만 표시

            symbol: L.Symbol.arrowHead({
              pixelSize: 15,

              polygon: true,

              headAngle: 45,

              pathOptions: {
                fillOpacity: 1,

                weight: 0,

                color: "#FF0000",
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

    // 애니메이션 함수

    let offset = 0

    const animate = () => {
      offset = (offset + 1) % 100 // offset 값을 증가시키며 반복

      animatedPolylines.forEach(({ decorator }) => {
        decorator.setPatterns([
          {
            offset: `${offset}%`,

            repeat: "10%",

            symbol: L.Symbol.dash({
              pixelSize: 10,

              pathOptions: { color: "#FF0000", weight: 2 },
            }),
          },
        ])
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    // 애니메이션 시작

    animate()

    // 컴포넌트 언마운트 시 제거

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
