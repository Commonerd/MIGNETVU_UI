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
    let canvasLayer = (L as any).canvasIconLayer({}).addTo(map)
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
      const marker = (L as any).canvasMarker(
        [network.latitude, network.longitude],
        {
          radius: size / 2,
          color,
          id: network.id,
        },
      )
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
