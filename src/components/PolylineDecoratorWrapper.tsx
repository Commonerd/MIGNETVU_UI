import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-polylinedecorator"

interface PolylineDecoratorWrapperProps {
  positions: [number, number][]
  patterns: any[]
}

const PolylineDecoratorWrapper: React.FC<PolylineDecoratorWrapperProps> = ({
  positions,
  patterns,
}) => {
  const map = useMap()

  useEffect(() => {
    if (!map || !positions || positions.length < 2) return

    // 기존 polyline을 addTo(map)하지 않음!
    const polyline = L.polyline(positions)
    const decorator = L.polylineDecorator(polyline, { patterns })
    decorator.addTo(map)

    return () => {
      map.removeLayer(decorator)
    }
  }, [map, positions, patterns])

  return null
}

export default PolylineDecoratorWrapper
