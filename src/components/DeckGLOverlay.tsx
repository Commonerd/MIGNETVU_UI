import React, { useMemo } from "react"
import DeckGL from "@deck.gl/react"
import { ScatterplotLayer, LineLayer } from "@deck.gl/layers"
import { TileLayer } from "@deck.gl/geo-layers"
import { MapView } from "@deck.gl/core"

type Props = {
  width: string | number
  height: string | number
  networks: any[]
  edges: any[]
  highlightedNode: any
  centralityValues: Record<number, number>
  centralityType: string
  onNodeClick: (network: any) => void
}

const DeckGLOverlay: React.FC<Props> = ({
  width,
  height,
  networks,
  edges,
  highlightedNode,
  centralityValues,
  centralityType,
  onNodeClick,
}) => {
  // 지도 타일 레이어 (OSM)
  const tileLayer = useMemo(
    () =>
      new TileLayer({
        id: "tile-layer",
        data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,
        renderSubLayers: (props) => {
          const {
            bbox: { west, south, east, north },
          } = props.tile
          return [
            new ScatterplotLayer(props, {
              id: `${props.id}-tile`,
              data: [],
            }),
            // 실제 타일 이미지를 렌더링
            new (require("@deck.gl/layers").BitmapLayer)({
              id: `${props.id}-bitmap`,
              bounds: [west, south, east, north],
              image: props.data,
            }),
          ]
        },
      }),
    [],
  )

  // 네트워크 노드 레이어
  const nodeLayer = useMemo(
    () =>
      new ScatterplotLayer({
        id: "scatterplot-layer",
        data: networks,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: (d) =>
          Math.max(
            6,
            (centralityValues[d.id] || 0) *
              (centralityType === "degree" ? 0.5 : 1.5) +
              6,
          ),
        getFillColor: (d) =>
          highlightedNode && highlightedNode.id === d.id
            ? [255, 165, 0, 255]
            : d.type === "Organization"
              ? [0, 0, 255, 255]
              : [255, 0, 0, 255],
        pickable: true,
        onClick: ({ object }) => onNodeClick(object),
      }),
    [networks, highlightedNode, centralityValues, centralityType, onNodeClick],
  )

  // 엣지(관계) 레이어
  const edgeLayer = useMemo(
    () =>
      new LineLayer({
        id: "line-layer",
        data: edges,
        getSourcePosition: (d) => [d[0][1], d[0][0]], // [lng, lat]
        getTargetPosition: (d) => [d[1][1], d[1][0]],
        getColor: [139, 69, 19, 180],
        getWidth: 2,
      }),
    [edges],
  )

  return (
    <DeckGL
      initialViewState={{
        longitude: 130,
        latitude: 40,
        zoom: 5,
        minZoom: 3,
        maxZoom: 10,
      }}
      controller={true}
      width={width}
      height={height}
      layers={[tileLayer, edgeLayer, nodeLayer]}
      views={new MapView({ repeat: true })}
    />
  )
}

export default DeckGLOverlay
