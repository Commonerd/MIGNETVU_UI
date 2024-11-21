import React, { useState, useEffect, useRef } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Tooltip,
  Popup,
  useMapEvents,
} from "react-leaflet"
import { useTranslation } from "react-i18next"
import "leaflet/dist/leaflet.css"
import L, { LatLng, LatLngExpression, LeafletMouseEvent } from "leaflet"
import "leaflet-polylinedecorator"
import {
  Migrant,
  Organization,
  EntityType,
  Connection,
  FilterOptions,
  Network,
  CsrfToken,
} from "../types"
import { mockMigrants, mockOrganizations } from "../mockData"
import { members } from "../members"
import styled from "styled-components"
import useStore from "../store"
import {
  useQueryAllNetworksOnMap,
  useQueryNetworks,
} from "../hooks/useQueryNetworks"
import { useError } from "../hooks/useError"
import axios from "axios"
import ClipboardJS from "clipboard"
import SearchResults from "./SearchResults"

// 중심 노드로 포커스 이동
const FocusMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 8, {
        animate: true,
      })
    }
  }, [lat, lng, map])
  return null
}

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
})

// Legend Component
const Legend = ({
  topNetworks,
  onEntityClick,
  centralityType,
}: {
  topNetworks: {
    id: number
    name: string
    centrality: number
    // type: "migrant" | "organization"
  }[]
  // onEntityClick: (id: number, type: "migrant" | "organization") => void
  onEntityClick: (id: number) => void
  centralityType: string
}) => {
  const map = useMap()
  const { t } = useTranslation()

  useEffect(() => {
    const legend = new L.Control({ position: "topright" })

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend")

      div.style.backgroundColor = "rgba(255, 255, 255, 0.7)"
      div.style.padding = "10px"
      div.style.borderRadius = "5px"
      div.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.2)"

      const labels = [
        `<div style="display: inline-block; width: 15px; height: 15px; background-color: red; border-radius: 50%; margin-right: 5px;"></div> ${t(
          "migrant",
        )}`,
        `<div style="display: inline-block; width: 15px; height: 15px; background-color: blue; border-radius: 50%; margin-right: 5px;"></div> ${t(
          "organization",
        )}`,
        // `<div style="display: inline-block; width: 15px; height: 5px; background-color: blue; margin-right: 5px;"></div> ${t(
        //   "friend",
        // )}`,
        // `<div style="display: inline-block; width: 15px; height: 5px; background-color: green; margin-right: 5px;"></div> ${t(
        //   "colleague",
        // )}`,
        // `<div style="display: inline-block; width: 15px; height: 5px; background-color: red; margin-right: 5px;"></div> ${t(
        //   "family",
        // )}`,
        // `<div style="display: inline-block; width: 15px; height: 5px; background-color: purple; margin-right: 5px;"></div> ${t(
        //   "professional",
        // )}`,
        // `<div style="display: inline-block; width: 15px; height: 5px; background-color: orange; margin-right: 5px;"></div> ${t(
        //   "cultural",
        // )}`,
      ]

      div.innerHTML = labels.join("<br>")
      if (centralityType !== "none") {
        const topEntitiesHtml = topNetworks
          .map(
            (entity, index) =>
              //`<div style="cursor: pointer;" data-id="${entity.id}" data-type="${entity.type}">${index + 1}. ${
              `<div style="cursor: pointer;" data-id="${entity.id}">${index + 1}. ${
                entity.name
              }: ${entity.centrality.toFixed(2)}</div>`,
          )
          .join("")
        div.innerHTML += `<br><br><strong>${t("topEntities")}</strong><br>${topEntitiesHtml}`
      }

      return div
    }

    legend.addTo(map)

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const id = target.getAttribute("data-id")
      // const type = target.getAttribute("data-type") as
      //   | "migrant"
      //   | "organization"
      // if (id && type) {
      //   onEntityClick(Number(id), type)
      // }
      if (id) {
        onEntityClick(Number(id))
      }
    }

    map.getContainer().addEventListener("click", handleClick)

    return () => {
      map.getContainer().removeEventListener("click", handleClick)
      legend.remove()
    }
  }, [map, t, topNetworks, centralityType, onEntityClick])

  return null
}

const Map: React.FC = () => {
  const { t } = useTranslation()
  const [networks, setNetworks] = useState<Network[] | undefined>()
  const [migrants, setMigrants] = useState<Migrant[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filters, setFilters] = useState<FilterOptions>({
    nationality: "all",
    ethnicity: "all",
    connectionType: "all",
    entityType: "all",
    yearRange: [1800, new Date().getFullYear()], // 현재 연도를 자동으로 설정
  })
  const [centralityType, setCentralityType] = useState<string>("none")
  const [highlightedNode, setHighlightedNode] = useState<{
    id: number
    // type: EntityType
  } | null>(null)
  const [focusedNode, setFocusedNode] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const { user } = useStore()
  const { data } = useQueryAllNetworksOnMap()
  const [latLng, setLatLng] = useState<LatLng | null>(null) // 타입을 LatLng | null로 설정
  const [copied, setCopied] = useState(false)
  const updateNetwork = useStore((state) => state.updateEditedNetwork)
  const [yearRange, setYearRange] = useState<[number, number]>([
    1800,
    new Date().getFullYear(),
  ]) // Year for migration trace
  const [searchQuery, setSearchQuery] = useState("")
  const [triggerSearch, setTriggerSearch] = useState(false)

  // useEffect(() => {
  //   axios.defaults.withCredentials = true
  //   const getCsrfToken = async () => {
  //     const { data } = await axios.get<CsrfToken>(
  //       `${process.env.REACT_APP_API_URL}/csrf`,
  //     )
  //     axios.defaults.headers.common["X-CSRF-Token"] = data.csrf_token
  //   }
  //   getCsrfToken()
  // }, [])

  useEffect(() => {
    if (!data) {
      console.error("No data available!")
      return
    }

    console.log("Setting networks:", data)
    setNetworks(data)
  }, [data])

  useEffect(() => {
    const markersLayer = L.layerGroup()
    console.log(networks)
    if (networks && networks.length > 0) {
      networks.forEach((network) => {
        const { latitude, longitude, title } = network

        // 마커 생성 및 팝업 설정
        const marker = L.marker([latitude, longitude]).bindPopup(
          `<b>${title}</b><br>Lat: ${latitude}, Lng: ${longitude}`,
        )

        markersLayer.addLayer(marker)
      })

      // LayerGroup을 지도에 추가
      //markersLayer.addTo(Map)
    }

    // 컴포넌트 언마운트 시 마커 제거
    return () => {
      markersLayer.clearLayers()
    }
  }, [Map, networks])

  // useEffect(() => {
  //   setMigrants(mockMigrants)
  //   setOrganizations(mockOrganizations)
  // }, [])

  // 필터링된 경로
  const filteredTraces =
    networks?.flatMap((network) =>
      network.migration_traces.filter(
        (trace) =>
          trace.migration_year >= yearRange[0] &&
          trace.migration_year <= yearRange[1],
      ),
    ) ?? [] // Fallback to an empty array if undefined

  const positions = filteredTraces.map(
    (trace: { latitude: any; longitude: any }) => [
      trace.latitude,
      trace.longitude,
    ],
  )

  // 시각화: 이주 시점마다 색깔을 다르게 표시
  const getColorByYear = (year: number): string => {
    // 연도에 따라 색상 지정
    if (year < 1900) return "red"
    if (year < 1950) return "orange"
    if (year < 2000) return "green"
    return "blue"
  }

  const migrationTraces =
    networks?.map((network) => network.migration_traces) ?? []

  // // 구간별 폴리라인 생성
  // const segments = migrationTraces
  //   .map(
  //     (
  //       trace: { latitude: any; longitude: any; migration_year: number },
  //       index: number,
  //     ) => {
  //       if (index === migrationTraces.length - 1) return null
  //       const nextTrace = migrationTraces[index + 1]
  //       return {
  //         positions: [
  //           [trace.latitude, trace.longitude],
  //           [nextTrace.latitude, nextTrace.longitude],
  //         ],
  //         color: getColorByYear(trace.migration_year),
  //       }
  //     },
  //   )
  //   .filter(Boolean)

  // 분석 기능: 이동 거리 계산
  const haversine = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371 // 지구 반지름 (km)
    const toRad = (value: number) => (value * Math.PI) / 180

    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // 거리 (km)
  }

  const totalDistance = filteredTraces.reduce(
    (
      distance: number,
      trace: { latitude: number; longitude: number },
      index: number,
    ) => {
      if (index === 0) return 0
      const prev = filteredTraces[index - 1]
      return (
        distance +
        haversine(
          prev.latitude,
          prev.longitude,
          trace.latitude,
          trace.longitude,
        )
      )
    },
    0,
  )

  // Example usage in handleEntityClick
  //const handleEntityClick = (id: number, type: "migrant" | "organization") => {
  const handleEntityClick = (id: number) => {
    const entity = getEntityById(id)
    if (entity) {
      setFocusedNode({ lat: entity.latitude, lng: entity.longitude })
    }
    setHighlightedNode((prev) => {
      // if (prev && prev.id === id && prev.type === type) {
      if (prev && prev.id === id) {
        return null
      }
      // return { id, type }
      return { id }
    })
  }

  // Update getEntityById function
  const getEntityById = (id: number) => {
    return networks?.find((n) => n.id === id) || null
  }

  const getConnectionColor = (type: Network["connections"][number]["type"]) => {
    switch (type) {
      // case 'friend':
      //   return 'blue'
      // case 'colleague':
      //   return 'green'
      // case 'family':
      //   return 'red'
      // case 'professional':
      //   return 'purple'
      // case 'cultural':
      //   return 'orange'
      default:
        return "gray"
    }
  }

  // Updated getEdges function
  const getEdges = () => {
    const edges: any[] = []

    const addEdges = (network: Network) => {
      network.connections.forEach((connection) => {
        if (
          (filters.connectionType === "all" ||
            connection.type === filters.connectionType) &&
          Number(connection.year) >= Number(filters.yearRange[0]) &&
          Number(connection.year) <= Number(filters.yearRange[1])
        ) {
          console.log(`Matched connection: ${JSON.stringify(connection)}`)

          const target = networks?.find((n) => n.id === connection.targetId)

          if (target) {
            edges.push([
              [network.latitude, network.longitude],
              [target.latitude, target.longitude],
              getConnectionColor(connection.type),
              connection.strength,
              connection.type,
              connection.year,
            ])
          }
        }
      })
    }

    // Filter and add edges for Network entities based on filters
    networks?.forEach((network) => {
      const migration_year = new Date(network.migration_year)

      if (
        (filters.entityType === "all" || filters.entityType === network.type) &&
        (filters.nationality === "all" ||
          network.nationality === filters.nationality) &&
        (filters.ethnicity === "all" ||
          network.ethnicity === filters.ethnicity) &&
        migration_year.getFullYear() >= filters.yearRange[0] &&
        migration_year.getFullYear() <= filters.yearRange[1]
      ) {
        addEdges(network)
      }
    })

    return edges
  }

  // useEffect(() => {
  //   const edges = getEdges()
  // }, [filters, networks])

  const handleFilterChange = (
    key: keyof FilterOptions,
    value: string | number[],
  ) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, [key]: value }
      return updatedFilters
    })
  }

  // const filteredMigrants = migrants.filter(
  //   (migrant) =>
  //     (filters.nationality === "all" ||
  //       migrant.nationality === filters.nationality) &&
  //     (filters.ethnicity === "all" ||
  //       migrant.ethnicity === filters.ethnicity) &&
  //     migrant.migrationYear >= filters.yearRange[0] &&
  //     migrant.migrationYear <= filters.yearRange[1],
  // )

  const filteredNetworks = networks
    ? networks.filter(
        (network) =>
          (filters.nationality === "all" ||
            network.nationality === filters.nationality) &&
          (filters.ethnicity === "all" ||
            network.ethnicity === filters.ethnicity) &&
          network.migration_year >= filters.yearRange[0] &&
          network.migration_year <= filters.yearRange[1],
      )
    : []

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.foundationYear >= filters.yearRange[0] &&
      org.foundationYear <= filters.yearRange[1],
  )

  const uniqueNationalities = Array.from(
    new Set(migrants.map((m) => m.nationality)),
  )
  const uniqueEthnicities = Array.from(
    new Set(migrants.map((m) => m.ethnicity)),
  )
  // Utility function to calculate shortest path using BFS
  const bfsShortestPath = (
    startId: number,
    connectionsMap: { [id: number]: number[] },
  ) => {
    const queue: [number, number][] = [[startId, 0]] // [nodeId, distance]
    const distances: { [id: number]: number } = { [startId]: 0 }
    const visited = new Set<number>([startId])

    while (queue.length > 0) {
      const [current, dist] = queue.shift()!
      connectionsMap[current].forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          distances[neighbor] = dist + 1
          queue.push([neighbor, dist + 1])
        }
      })
    }

    return distances
  }

  const calculateCentrality = () => {
    let centrality: { [id: number]: number } = {}
    const connectionsMap: { [id: number]: number[] } = {}

    // Build a connections map
    //;[...migrants, ...organizations].forEach((entity) => {
    ;[...(networks ?? [])].forEach((entity) => {
      connectionsMap[entity.id] = entity.connections.map(
        (connection) => connection.targetId,
      )
    })

    switch (centralityType) {
      case "degree":
        for (const id in connectionsMap) {
          centrality[id] = connectionsMap[id].length
        }
        break

      case "betweenness":
        // Betweenness centrality implementation (as shown previously)
        for (const id in connectionsMap) {
          centrality[id] = 0
        }

        for (const startId in connectionsMap) {
          const shortestPaths: { [id: number]: number[][] } = {}
          const distances: { [id: number]: number } = {}
          const queue: number[] = [Number(startId)]
          const predecessors: { [id: number]: number[] } = {}

          Object.keys(connectionsMap).forEach((id) => {
            distances[Number(id)] = Infinity
            shortestPaths[Number(id)] = []
            predecessors[Number(id)] = []
          })

          distances[Number(startId)] = 0
          shortestPaths[Number(startId)].push([Number(startId)])

          while (queue.length > 0) {
            const current = queue.shift()!
            connectionsMap[current].forEach((neighbor) => {
              if (distances[neighbor] === Infinity) {
                distances[neighbor] = distances[current] + 1
                queue.push(neighbor)
              }
              if (distances[neighbor] === distances[current] + 1) {
                predecessors[neighbor].push(current)
              }
            })
          }

          const dependency: { [id: number]: number } = {}

          Object.keys(predecessors).forEach((id) => {
            dependency[Number(id)] = 0
          })

          const nodes = Object.keys(predecessors)
            .map(Number)
            .sort((a, b) => distances[b] - distances[a])

          nodes.forEach((w) => {
            predecessors[w].forEach((v) => {
              const fraction = (1 + dependency[w]) / predecessors[w].length
              dependency[v] += fraction
            })

            if (w !== Number(startId)) {
              centrality[w] += dependency[w]
            }
          })
        }

        const totalNodes = Object.keys(connectionsMap).length
        Object.keys(centrality).forEach((id) => {
          centrality[Number(id)] /= (totalNodes - 1) * (totalNodes - 2)
        })

        break

      case "closeness":
        for (const id in connectionsMap) {
          const distances = bfsShortestPath(Number(id), connectionsMap)
          const totalDistance = Object.values(distances).reduce(
            (acc, d) => acc + d,
            0,
          )
          centrality[id] = totalDistance > 0 ? 1 / totalDistance : 0
        }
        break

      case "eigenvector":
        // Initialize eigenvector centrality values to 1
        const numNodes = Object.keys(connectionsMap).length
        let eigenCentrality: { [id: number]: number } = {}
        let prevEigenCentrality: { [id: number]: number } = {}

        Object.keys(connectionsMap).forEach((id) => {
          eigenCentrality[Number(id)] = 1
        })

        const maxIterations = 100
        const tolerance = 1e-6
        let delta = Infinity
        let iterations = 0

        // Power iteration to calculate eigenvector centrality
        while (delta > tolerance && iterations < maxIterations) {
          prevEigenCentrality = { ...eigenCentrality }
          delta = 0

          for (const id in connectionsMap) {
            let sum = 0
            connectionsMap[Number(id)].forEach((neighbor) => {
              sum += prevEigenCentrality[neighbor]
            })
            eigenCentrality[Number(id)] = sum
          }

          // Normalize the eigenvector centrality values
          const norm = Math.sqrt(
            Object.values(eigenCentrality).reduce(
              (acc, val) => acc + val * val,
              0,
            ),
          )
          for (const id in eigenCentrality) {
            eigenCentrality[Number(id)] /= norm
          }

          // Calculate the delta (change) between iterations
          Object.keys(eigenCentrality).forEach((id) => {
            delta += Math.abs(
              eigenCentrality[Number(id)] - prevEigenCentrality[Number(id)],
            )
          })

          iterations++
        }

        // Assign eigenvector centrality to the result
        centrality = eigenCentrality
        break

      default:
        break
    }

    return centrality
  }

  const centralityValues = calculateCentrality()

  const topNetworks = Object.entries(centralityValues)
    .filter(([id]) => networks?.some((m) => m.id === Number(id)))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, centrality]) => {
      const network = networks?.find((m: { id: number }) => m.id === Number(id))
      return {
        id: Number(id),
        name: String(network ? network.title : "Unknown"),
        centrality,
      }
    })

  const topMigrants = Object.entries(centralityValues)
    .filter(([id]) => migrants.some((m) => m.id === Number(id)))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, centrality]) => {
      const migrant = migrants.find((m) => m.id === Number(id))
      return {
        id: Number(id),
        name: migrant ? migrant.name : "Unknown",
        centrality,
      }
    })

  const topOrganizations = Object.entries(centralityValues)
    .filter(([id]) => organizations.some((o) => o.id === Number(id)))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, centrality]) => {
      const organization = organizations.find((o) => o.id === Number(id))
      return {
        id: Number(id),
        name: organization ? organization.name : "Unknown",
        centrality,
      }
    })

  const getNodeSize = (centrality: number, centralityType: string) => {
    let baseSize = 10
    let scaleFactor = 5

    if (centralityType === "degree") {
      scaleFactor = 3
    } else if (
      centralityType === "closeness" ||
      centralityType === "eigenvector"
    ) {
      scaleFactor = 30
    } else if (centralityType === "betweenness") {
      scaleFactor = 500
    }

    return Math.max(baseSize, centrality * scaleFactor + baseSize)
  }

  // 등록자별 노드 수 계산
  const registrantNodeCounts =
    networks?.reduce(
      (acc, entity) => {
        acc[entity.user_id] = (acc[entity.user_id] || 0) + 1
        return acc
      },
      {} as { [registrantId: number]: number },
    ) || {}

  // 유저 이름을 가져오기 위한 사용자 정보 맵핑
  const userNames = networks?.reduce(
    (acc, entity) => {
      acc[entity.user_id] = entity.user_name // 유저 ID와 유저 이름을 매핑
      return acc
    },
    {} as { [userId: number]: string },
  )

  // 상위 3명의 등록자 추출 및 정렬
  const topRegistrants = Object.entries(registrantNodeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([registrantId, count], index) => ({
      registrantId: Number(registrantId),
      userName: userNames[Number(registrantId)], // 유저 이름을 가져옴
      count,
      medal: index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉",
    }))

  // 마우스 우클릭 시 위도와 경도 표시
  const HandleRightClick = () => {
    const map = useMapEvents({
      contextmenu(e) {
        setLatLng(e.latlng) // 우클릭 위치의 latlng을 상태로 설정
      },
    })

    return null
  }

  // 복사 버튼 클릭 시 클립보드에 위도와 경도 복사
  const copyToClipboard = () => {
    if (latLng) {
      // Update latitude and longitude in the store
      updateNetwork({
        id: 0,
        user_id: 0,
        title: "",
        type: "Migrant",
        nationality: "",
        ethnicity: "",
        migration_year: 0,
        latitude: latLng.lat,
        longitude: latLng.lng,
        connections: [
          {
            targetType: "Migrant",
            targetId: 0,
            strength: 0,
            type: "",
            year: 0,
          },
        ],
      })

      // latLng가 null이 아닐 때만 실행
      const clipboard = new ClipboardJS(".copy-btn", {
        text: () => `${latLng.lat}, ${latLng.lng}`,
      })

      clipboard.on("success", () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000) // 2초 후에 '복사됨' 메시지를 사라지게
      })
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleSearchClick = () => {
    if (searchQuery.trim() !== "") {
      setTriggerSearch(true)
    }
  }

  const CustomMapComponent = () => {
    const map = useMap()
    const [activeTooltip, setActiveTooltip] = useState<L.Tooltip | null>(null)
    const [layerGroup, setLayerGroup] = useState<L.LayerGroup | null>(null)
    const [edgeLayer, setEdgeLayer] = useState<L.LayerGroup | null>(null) // edgeLayer 상태 추가

    useEffect(() => {
      // 기존 레이어 제거
      if (edgeLayer) {
        edgeLayer.clearLayers()
        edgeLayer.remove() // 기존 레이어 제거
      }

      // 새 레이어 그룹 생성
      const newLayerGroup = L.layerGroup().addTo(map)
      setLayerGroup(newLayerGroup)

      const newEdgeLayer = L.layerGroup().addTo(map) // edgeLayer 생성
      setEdgeLayer(newEdgeLayer)

      const edges = getEdges() // 각 엣지의 정보를 가져오는 함수
      edges.forEach((edge) => {
        const positions = edge.slice(0, 2) as LatLngExpression[]
        const color = edge[2] as string
        const opacity = (edge[3] as number) * 0.16 + 0.2
        const connectionType = edge[4] as string
        const connectionStrength = edge[3] as number
        const connectionYear = edge[5] as number

        // Leaflet Polyline 객체 생성
        const leafletPolyline = L.polyline(positions, {
          color: color,
          weight: 2,
          opacity: opacity,
        }).addTo(newEdgeLayer) // edgeLayer에 추가

        // Tooltip 내용 정의
        const tooltipContent = `<span>${t("connectionType")}: ${t(
          connectionType,
        )}<br/>${t("connectionStrength")}: ${connectionStrength}<br/>${t(
          "connectionYear",
        )}: ${connectionYear}</span>`

        // 마우스를 올렸을 때만 툴팁 표시
        leafletPolyline.bindTooltip(tooltipContent, {
          permanent: false,
          direction: "top",
          opacity: 0.9,
        })

        // 클릭 이벤트 리스너 추가: 클릭 시 툴팁 고정
        leafletPolyline.on("click", (e: LeafletMouseEvent) => {
          if (activeTooltip) {
            activeTooltip.remove()
          }
          const tooltip = leafletPolyline
            .bindTooltip(tooltipContent, {
              permanent: true,
              direction: "top",
              opacity: 0.9,
            })
            .openTooltip(e.latlng)
          setActiveTooltip(tooltip)
        })

        // 더블 클릭 이벤트 리스너 추가: 더블 클릭 시 툴팁 닫기
        leafletPolyline.on("dblclick", () => {
          if (activeTooltip) {
            activeTooltip.remove()
            setActiveTooltip(null)
          }
        })

        // arrowHead가 정의되어 있는지 확인
        if (L.Symbol && L.Symbol.arrowHead) {
          const decorator = L.polylineDecorator(leafletPolyline, {
            patterns: [
              {
                offset: 0, // Start the arrow at the end of the polyline
                repeat: 200, // Set a large repeat value to space out arrows
                symbol: L.Symbol.arrowHead({
                  pixelSize: 15,
                  polygon: false,
                  headAngle: 45,
                  pathOptions: {
                    stroke: false,
                    color: "#7f8c8d",
                    weight: 2,
                    opacity: 0.85,
                    lineCap: "round",
                    lineJoin: "round",
                    dashArray: "6,6",
                    dashOffset: "0",
                    fill: true,
                    fillColor: "#27ae60",
                    fillOpacity: 0.8,
                    fillRule: "evenodd",
                  },
                }),
              },
            ],
          })

          decorator.addTo(newEdgeLayer) // edgeLayer에 추가
        } else {
          console.error("L.Symbol.arrowHead is not defined")
        }
      })

      return () => {
        // 컴포넌트가 언마운트될 때 레이어 정리
        if (newLayerGroup) {
          map.removeLayer(newLayerGroup)
        }
        if (newEdgeLayer) {
          newEdgeLayer.clearLayers()
          newEdgeLayer.remove() // edgeLayer를 명시적으로 정리
        }
      }
    }, [map, activeTooltip, filters]) // edgeLayer 추가 의존성

    return null
  }

  return (
    <div className="h-[calc(85vh-64px)] relative">
      {user.isLoggedIn ? (
        <>
          <div className="p-2 bg-gray-50">
            <div className="flex flex-wrap gap-3">
              {/* Entity Filters */}
              <div className="p-2 border rounded bg-gray-50 flex flex-wrap gap-2 items-center">
                <select
                  value={filters.entityType}
                  onChange={(e) =>
                    handleFilterChange("entityType", e.target.value)
                  }
                  className="p-1 border rounded text-sm w-30 h-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">{t("allEntityTypes")}</option>
                  <option value="migrant">{t("migrant")}</option>
                  <option value="organization">{t("organization")}</option>
                </select>
                {filters.entityType !== "organization" && (
                  <>
                    <select
                      value={filters.nationality}
                      onChange={(e) =>
                        handleFilterChange("nationality", e.target.value)
                      }
                      className="p-1 border rounded text-sm w-24 h-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">{t("allNationalities")}</option>
                      {uniqueNationalities.map((nationality) => (
                        <option key={nationality} value={nationality}>
                          {nationality}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filters.ethnicity}
                      onChange={(e) =>
                        handleFilterChange("ethnicity", e.target.value)
                      }
                      className="p-1 border rounded text-sm w-24 h-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">{t("allEthnicities")}</option>
                      {uniqueEthnicities.map((ethnicity) => (
                        <option key={ethnicity} value={ethnicity}>
                          {ethnicity}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <select
                  value={filters.connectionType}
                  onChange={(e) =>
                    handleFilterChange("connectionType", e.target.value)
                  }
                  className="p-1 border rounded text-sm w-24 h-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">{t("allConnectionTypes")}</option>
                  <option value="friend">{t("friend")}</option>
                  <option value="colleague">{t("colleague")}</option>
                  <option value="family">{t("family")}</option>
                  <option value="professional">{t("professional")}</option>
                  <option value="cultural">{t("cultural")}</option>
                </select>
              </div>

              {/* Year Range */}
              <div className="p-2 border rounded bg-gray-50 flex gap-2 items-center">
                <label className="text-sm">{t("yearRange")}</label>
                <input
                  type="number"
                  value={filters.yearRange[0]}
                  onChange={(e) =>
                    handleFilterChange("yearRange", [
                      parseInt(e.target.value),
                      filters.yearRange[1],
                    ])
                  }
                  className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm">-</span>
                <input
                  type="number"
                  value={filters.yearRange[1]}
                  onChange={(e) =>
                    handleFilterChange("yearRange", [
                      filters.yearRange[0],
                      parseInt(e.target.value),
                    ])
                  }
                  className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Centrality */}
              <div className="p-2 border rounded bg-gray-50 flex items-center">
                <select
                  value={centralityType}
                  onChange={(e) => setCentralityType(e.target.value)}
                  className="p-1 border rounded text-sm w-32 h-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="none">{t("selectCentrality")}</option>
                  <option value="degree">{t("degreeCentrality")}</option>
                </select>
              </div>

              {/* Migration Traceability */}
              <div className="p-2 border rounded bg-gray-50 flex gap-2 items-center">
                <label className="text-sm">{t("migrationTraceability")}</label>
                <input
                  type="number"
                  value={yearRange[0]}
                  onChange={(e) =>
                    setYearRange([Number(e.target.value), yearRange[1]])
                  }
                  className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm">-</span>
                <input
                  type="number"
                  value={yearRange[1]}
                  onChange={(e) =>
                    setYearRange([yearRange[0], Number(e.target.value)])
                  }
                  className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Search */}
              <div className="p-2 border rounded bg-gray-50 flex gap-3 items-center">
                <input
                  type="text"
                  placeholder={t("Search Networks")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchClick()
                    }
                  }}
                  className="w-48 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSearchClick}
                  className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m1.94-7.15a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Render Search Results */}
            {triggerSearch && searchQuery && (
              <div className="mt-4 flex justify-end">
                <div
                  className="bg-white shadow rounded p-4"
                  style={{
                    maxWidth: "50%", // 최대 너비 제한 (필요에 따라 조정 가능)
                    width: "fit-content", // 내용에 맞게 너비 조정
                  }}
                >
                  <SearchResults searchQuery={searchQuery} />
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <></>
      )}
      <MapContainer
        center={[37.5665, 126.978]}
        zoom={2}
        style={{ height: "calc(100% - 60px)", width: "100%" }}
      >
        <HandleRightClick />
        {latLng && (
          <Marker position={latLng}>
            <Popup>
              <div style={{ textAlign: "center" }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong>Lat:</strong> {latLng.lat}
                </p>
                <p style={{ marginBottom: "20px" }}>
                  <strong>Lng:</strong> {latLng.lng}
                </p>
                <button
                  className="copy-btn"
                  data-clipboard-text={`${latLng.lat}, ${latLng.lng}`}
                  onClick={copyToClipboard}
                  style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    backgroundColor: copied ? "green" : "#007BFF", // 복사 후 버튼 색상은 녹색
                    color: copied ? "#fff" : "#fff", // 글자 색상은 흰색으로 고정
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease", // 부드러운 배경색 변화
                  }}
                >
                  {copied ? (
                    <span>Copied!</span> // 복사 후 상태 표시
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
            </Popup>
          </Marker>
        )}
        {focusedNode && (
          <FocusMap lat={focusedNode.lat} lng={focusedNode.lng} />
        )}
        <LegendBox>
          <h2>{t("topRegistrants")}</h2>
          <ul>
            {topRegistrants.map((registrant) => (
              <li key={registrant.registrantId}>
                {registrant.medal} {registrant.userName} : {registrant.count}{" "}
                {t("nodeCount")}
              </li>
            ))}
          </ul>
        </LegendBox>
        <Legend
          // topMigrants={topMigrants}
          // topOrganizations={topOrganizations}
          topNetworks={topNetworks}
          onEntityClick={handleEntityClick}
          centralityType={centralityType}
        />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* {(filters.entityType === "all" || filters.entityType === "migrant") &&
          filteredMigrants.map((migrant) => {
            const size = getNodeSize(
              centralityValues[migrant.id] || 0,
              centralityType,
            )

            const isHighlighted =
              highlightedNode &&
              highlightedNode.id === migrant.id &&
              highlightedNode.type === "migrant"

            return (
              <Marker
                key={`migrant-${migrant.id}`}
                position={[migrant.latitude, migrant.longitude]}
                icon={L.divIcon({
                  className: "custom-marker",
                  html: `<div style="width: ${size}px; height: ${size}px; background-color: ${
                    isHighlighted ? "yellow" : "red"
                  }; border-radius: 50%;"></div>`,
                  iconSize: [size, size],
                })}
              >
                <Tooltip>
                  <h2 className="text-lg font-bold">{migrant.name}</h2>
                  <p>id : {migrant.id} </p>
                  <p>
                    {t("registrantId")} : {migrant.registrantId}
                  </p>
                  <p>
                    {t("centrality")}: {centralityValues[migrant.id] || 0}
                  </p>
                  <p>
                    {t("nationality")}: {migrant.nationality}
                  </p>
                  <p>
                    {t("ethnicity")}: {migrant.ethnicity}
                  </p>
                  <p>
                    {t("migrationYear")}: {migrant.migrationYear}
                  </p>
                  <p>
                    {t("age")}: {migrant.age}
                  </p>
                  <p>
                    {t("occupation")}: {migrant.occupation}
                  </p>
                  <p>
                    {t("education")}: {migrant.education}
                  </p>
                  <p>
                    {t("languagesSpoken")}: {migrant.languagesSpoken.join(", ")}
                  </p>
                </Tooltip>
              </Marker>
            )
          })} */}
        {/* {(filters.entityType === "all" ||
          filters.entityType === "organization") &&
          filteredOrganizations.map((org) => {
            const size = getNodeSize(
              centralityValues[org.id] || 0,
              centralityType,
            )
            const isHighlighted =
              highlightedNode &&
              highlightedNode.id === org.id &&
              highlightedNode.type === "organization"
            return (
              <Marker
                key={`org-${org.id}`}
                position={[org.latitude, org.longitude]}
                icon={L.divIcon({
                  className: "custom-marker",
                  html: `<div style="width: ${size}px; height: ${size}px; background-color: ${
                    isHighlighted ? "yellow" : "blue"
                  }; border-radius: 50%;"></div>`,
                  iconSize: [size, size],
                })}
              >
                <Tooltip>
                  <div>
                    <h2 className="text-lg font-bold">{org.name}</h2>
                    <p>id: {org.id} </p>
                    <p>
                      {t("registrantId")} : {org.registrantId}
                    </p>
                    <p>
                      {t("centrality")}: {centralityValues[org.id] || 0}
                    </p>
                    <p>
                      {t("foundationYear")}: {org.foundationYear}
                    </p>
                    <p>
                      {t("type")}: {org.type}
                    </p>
                    <p>
                      {t("mission")}: {org.mission}
                    </p>
                    <p>
                      {t("services")}: {org.services.join(", ")}
                    </p>
                    <p>
                      {t("contactInfo")}: {org.contactInfo}
                    </p>
                  </div>
                </Tooltip>
              </Marker>
            )
          })}
        {getEdges().map((edge, index) => {
          const positions = edge.slice(0, 2) as unknown as [number, number][]
          const color = edge[2] as unknown as string
          const opacity = (edge[3] as unknown as number) * 0.16 + 0.2

          return (
            <Polyline
              key={index}
              positions={positions}
              color={color}
              weight={2}
              opacity={opacity}
            >
              <Tooltip>
                <span>
                  {`${t("connectionType")}: ${t(String(edge[4]))}`}
                  <br />
                  {`${t("connectionStrength")}: ${edge[3]}`}
                </span>
              </Tooltip>
            </Polyline>
          )
        })} */}
        {/* 지도에 표시될 네트워크 데이터 */}
        {(filters.entityType === "all" ||
          filters.entityType === "migrant" ||
          filters.entityType === "organization") &&
          filteredNetworks
            .filter((network) => {
              // Filter based on entityType
              if (filters.entityType === "migrant")
                return network.type === "Migrant"
              if (filters.entityType === "organization")
                return network.type === "Organization"
              return true // Show all for "all"
            })
            .map((network) => {
              const size = getNodeSize(
                centralityValues[network.id] || 0,
                centralityType,
              )

              const isHighlighted =
                highlightedNode && highlightedNode.id === network.id

              // Determine color: Organization is blue, highlighted is yellow, default is red
              let color = network.type === "Organization" ? "blue" : "red" // Migrant is red by default
              if (isHighlighted) {
                // Highlighted nodes are yellow regardless of type
                color = "yellow"
              }

              return (
                <Marker
                  key={network.id}
                  position={[network.latitude, network.longitude]}
                  icon={L.divIcon({
                    className: "custom-marker",
                    html: `<div style="width: ${size}px; height: ${size}px; background-color: ${color}; border-radius: 50%;"></div>`,
                    iconSize: [size, size],
                  })}
                >
                  <Tooltip>
                    <div className="p-4">
                      <strong className="text-lg font-semibold block mb-2">
                        No.{network.id} : {network.title}
                      </strong>
                      <div className="text-gray-700 text-sm space-y-1">
                        <p>
                          <span className="font-medium">Creator Name:</span>{" "}
                          {userNames[network.user_id]}{" "}
                          {/* userNames 객체에서 유저 이름을 가져옵니다 */}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {network.type}
                        </p>
                        <p>
                          {t("centrality")}: {centralityValues[network.id] || 0}
                        </p>
                        <p>
                          <span className="font-medium">Nationality:</span>{" "}
                          {network.nationality}
                        </p>
                        <p>
                          <span className="font-medium">Ethnicity:</span>{" "}
                          {network.ethnicity}
                        </p>
                        <p>
                          <span className="font-medium">Migration Year:</span>{" "}
                          {network.migration_year}
                        </p>
                        <p>
                          <span className="font-medium">Latitude:</span>{" "}
                          {network.latitude.toFixed(5)}
                        </p>
                        <p>
                          <span className="font-medium">Longitude:</span>{" "}
                          {network.longitude.toFixed(5)}
                        </p>
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              )
            })}
        <CustomMapComponent /> {/* MapContainer 내부에 위치시킴 */}
        {filteredTraces.map(
          (trace: {
            id: React.Key | null | undefined
            network_id: number
            latitude: number
            longitude: number
            location_name:
              | string
              | number
              | boolean
              | React.ReactElement<
                  any,
                  string | React.JSXElementConstructor<any>
                >
              | Iterable<React.ReactNode>
              | React.ReactPortal
              | null
              | undefined
            migration_year:
              | string
              | number
              | boolean
              | React.ReactElement<
                  any,
                  string | React.JSXElementConstructor<any>
                >
              | Iterable<React.ReactNode>
              | React.ReactPortal
              | null
              | undefined
          }) => (
            <Marker key={trace.id} position={[trace.latitude, trace.longitude]}>
              <Popup>
                <div
                  style={{
                    fontSize: "18px",
                    lineHeight: "1.6",
                    margin: "0",
                    padding: "0",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Network ID:</strong> {trace.network_id}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Place:</strong> {trace.location_name}
                  </div>
                  <div>
                    <strong>Migration Year:</strong> {trace.migration_year}
                  </div>
                </div>
              </Popup>
            </Marker>
          ),
        )}
        <Polyline
          positions={positions}
          color="#42A5F5"
          weight={5}
          opacity={0.7}
          dashArray="5, 10"
          lineCap="round"
          lineJoin="round"
        />
        {/* {segments.map(
          (
            segment: {
              positions: L.LatLngExpression[] | L.LatLngExpression[][]
              color: string | undefined
            },
            index: React.Key | null | undefined,
          ) => (
            <Polyline
              key={index}
              positions={segment.positions}
              color={segment.color}
            />
          ),
        )} */}
      </MapContainer>
    </div>
  )
}

const LegendBox = styled.div`
  position: relative;
  top: 0.5rem;
  left: 2rem;
  width: 10rem;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  z-index: 1000; /* 지도 위에 표시되도록 z-index 설정 */
  font-size: 0.7rem;

  h2 {
    font-size: 0.8rem; /* h2 태그의 글자 크기 조정 */
  }

  ul {
    font-size: 0.7rem; /* ul 태그의 글자 크기 조정 */
  }

  @media (max-width: 768px) {
    position: relative;
    left: 2.5rem;
    width: 9rem; /* 모바일에서 가로 길이 조정 */
    font-size: 0.7rem;

    h2 {
      font-size: 0.7rem; /* 모바일에서 h2 태그의 글자 크기 조정 */
    }

    ul {
      font-size: 0.6rem; /* 모바일에서 ul 태그의 글자 크기 조정 */
    }
  }

  @media (max-width: 480px) {
    position: relative;
    left: 3rem;
    width: 7rem; /* 더 작은 화면에서 가로 길이 조정 */
    font-size: 0.6rem;

    h2 {
      font-size: 0.6rem; /* 더 작은 화면에서 h2 태그의 글자 크기 조정 */
    }

    ul {
      font-size: 0.5rem; /* 더 작은 화면에서 ul 태그의 글자 크기 조정 */
    }
  }
`

export default Map
