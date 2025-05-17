import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-canvas-marker"

declare module "leaflet" {
  function canvasIconLayer(options?: any): any
  function canvasMarker(latlng: L.LatLngExpression, options?: any): any
}

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

    // leaflet-canvas-marker가 window.L에 등록되는 경우도 있으니 fallback 처리
    const canvasIconLayerFn =
      (L as any).canvasIconLayer || (window as any).L?.canvasIconLayer
    const canvasMarkerFn =
      (L as any).canvasMarker || (window as any).L?.canvasMarker

    if (
      typeof canvasIconLayerFn !== "function" ||
      typeof canvasMarkerFn !== "function"
    ) {
      console.error("leaflet-canvas-marker 플러그인 import/설치 확인 필요")
      return
    }

    const canvasLayer = canvasIconLayerFn({}).addTo(map)
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
  }, [
    map,
    networks,
    highlightedNode,
    centralityValues,npm install react-leaflet-markercluster
    
    centralityType,
    getNodeSize,
  ])
  return null
}

export default CanvasMarkers
