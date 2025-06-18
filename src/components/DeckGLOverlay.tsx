import React, { useMemo } from "react"
import DeckGL from "@deck.gl/react"
import { ScatterplotLayer, LineLayer, BitmapLayer } from "@deck.gl/layers"
import { TileLayer } from "@deck.gl/geo-layers"
import { MapView } from "@deck.gl/core"
import type { PickingInfo } from "@deck.gl/core"
import type { Network, Edge } from "../types"
import { TileBoundingBox, GeoBoundingBox } from "../types"

type Props = {
  width: string | number
  height: string | number
  networks: Network[]
  edges: Edge[]
  highlightedNode: Network | null
  centralityValues: Record<number, number>
  centralityType: string
  onNodeClick: (network: Network) => void
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
          const { bbox } = props.tile

          if (isGeoBoundingBox(bbox)) {
            const { west, south, east, north } = bbox
            return [
              new BitmapLayer(props, {
                id: `${props.id}-bitmap`,
                bounds: [west, south, east, north],
                image: props.data,
              }),
            ]
          } else {
            // Handle NonGeoBoundingBox case if necessary
            console.error("NonGeoBoundingBox is not supported in this context.")
            return null
          }
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
        getPosition: (d: Network) => [d.longitude, d.latitude],
        getRadius: (d: Network & { radius?: number }) => d.radius ?? 10,
        getFillColor: (
          d: Network & { color?: [number, number, number, number] },
        ) => d.color ?? [0, 0, 255, 200],
        pickable: true,
        onClick: (info: PickingInfo & { object?: Network }) => {
          if (info.object) {
            onNodeClick(info.object)
          }
        },
      }),
    [networks, onNodeClick],
  )

  // 엣지(관계) 레이어
  const edgeLayer = useMemo(
    () =>
      new LineLayer({
        id: "line-layer",
        data: edges,
        getSourcePosition: (d: [[number, number], [number, number]]) => [
          d[0][1],
          d[0][0],
        ], // [lng, lat]
        getTargetPosition: (d: [[number, number], [number, number]]) => [
          d[1][1],
          d[1][0],
        ],
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

function isGeoBoundingBox(bbox: TileBoundingBox): bbox is GeoBoundingBox {
  return "west" in bbox && "north" in bbox && "east" in bbox && "south" in bbox
}

export default DeckGLOverlay
