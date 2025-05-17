import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-canvas-marker"

type CanvasMarkersProps = {
  networks: any[]
  onMarkerClick: (network: any) => void
  highlightedNode: any
  centralityValues: Record<number, number>
  centralityType: string
  getNodeSize: (centrality: number, centralityType: string) => number
}

const CanvasMarkers = ({
  networks,
  onMarkerClick,
  highlightedNode,
  centralityValues,
  centralityType,
  getNodeSize,
}: CanvasMarkersProps) => {
  const map = useMap()
  useEffect(() => {
    if (!map || !networks) return
    // canvasIconLayer가 함수인지 확인
    const canvasIconLayerFn =
      (L as any).canvasIconLayer || (window as any).L?.canvasIconLayer
    if (typeof canvasIconLayerFn !== "function") {
      console.error(
        "canvasIconLayer is not a function. leaflet-canvas-marker 플러그인 import/설치 확인 필요",
      )
      return
    }
    let canvasLayer = canvasIconLayerFn({}).addTo(map)
    networks.forEach((network) => {
      const size = getNodeSize(
        centralityValues[network.id] || 0,
        centralityType,
      )
      const color =
        highlightedNode && highlightedNode.id === network.id
          ? "orange"
          : network.type === "Organization"
            ? "blue"
            : "red"
      const canvasMarkerFn =
        (L as any).canvasMarker || (window as any).L?.canvasMarker
      if (typeof canvasMarkerFn !== "function") {
        console.error(
          "canvasMarker is not a function. leaflet-canvas-marker 플러그인 import/설치 확인 필요",
        )
        return
      }
      const marker = canvasMarkerFn([network.latitude, network.longitude], {
        radius: size / 2,
        color,
        id: network.id,
      })
      marker.addTo(canvasLayer)
      marker.on("click", () => onMarkerClick(network))
    })
    return () => {
      map.removeLayer(canvasLayer)
    }
    // eslint-disable-next-line
  }, [
    map,
    networks,
    highlightedNode,
    centralityValues,
    centralityType,
    getNodeSize,
  ])
  return null
}

export default CanvasMarkers
