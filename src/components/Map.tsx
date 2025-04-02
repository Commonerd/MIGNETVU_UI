import React, { useState, useEffect, useRef, useMemo } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Tooltip,
  Popup,
  useMapEvents,
  CircleMarker,
} from "react-leaflet"
import { useTranslation } from "react-i18next"
import "leaflet/dist/leaflet.css"
import L, {
  LatLng,
  LatLngExpression,
  LeafletMouseEvent,
  PolylineDecorator,
} from "leaflet"
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
import Select from "react-select"
import CommentSection from "./CommentSection"
import "leaflet-polylinedecorator"
import ThreeDMap from "./ThreeDMap"
import MigrationTraceDecorator from "./MigrationTraceDecorator"
import { calculateCentrality } from "../utils/centralityUtils"
import { fetchComments } from "../api/comments"
import Slider from "react-slick"

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
              `<div style="cursor: pointer;" data-id="${entity.id}">${
                index + 1
              }. ${entity.name}: ${entity.centrality.toFixed(2)}</div>`,
          )
          .join("")
        div.innerHTML += `<br><br><strong>${t(
          "topEntities",
        )}</strong><br>${topEntitiesHtml}`
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
  const isMobile = window.innerWidth <= 768

  const { t } = useTranslation()
  const [networks, setNetworks] = useState<Network[] | undefined>()
  const [migrants, setMigrants] = useState<Migrant[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filters, setFilters] = useState<FilterOptions>({
    nationality: ["all"],
    ethnicity: ["all"],
    edgeType: ["all"],
    entityType: "all",
    yearRange: [1800, new Date().getFullYear()],
    userNetworkFilter: true,
    userNetworkTraceFilter: true,
    userNetworkConnectionFilter: true,
    migrationReasons: ["all"],
    selectedMigrationNetworkId: null, // 선택된 네트워크 ID 추가
  })
  const [centralityType, setCentralityType] = useState<string>("none")
  const [highlightedNode, setHighlightedNode] = useState<{
    id: number
    photo: string
    // type: EntityType
  } | null>(null)
  const [focusedNode, setFocusedNode] = useState<{
    id: number | null
    lat: number
    lng: number
  } | null>(null)
  const { user } = useStore()
  const { data } = useQueryAllNetworksOnMap()
  const [latLng, setLatLng] = useState<LatLng | null>(null) // 타입을 LatLng | null로 설정
  const [copied, setCopied] = useState(false)
  const updateNetwork = useStore((state) => state.updateEditedNetwork)
  const [yearRange, setYearRange] = useState<[number, number]>([0, 0]) // Year for migration trace
  const [searchQuery, setSearchQuery] = useState("")
  const [triggerSearch, setTriggerSearch] = useState(false)
  const [is3DMode, setIs3DMode] = useState(false) // 3D 모드 상태 추가
  const [selectedMigrationNetworkId, setSelectedMigrationNetworkId] = useState<
    number | null
  >(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<number | null>(null)
  const [selectedNetworkId, setSelectedNetworkId] = useState<number | null>(
    null,
  )
  const [isFiltersVisible, setIsFiltersVisible] = useState(true) // 필터 표시 여부 상태

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 200,
    slidesToShow: 1,
    slidesToScroll: 1,
  }

  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible) // 필터 표시/숨기기 토글
  }

  const toggle3DMode = () => {
    setIs3DMode(!is3DMode)
  }

  useEffect(() => {
    if (!data) {
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

  const filteredTraces =
    networks?.flatMap((network) =>
      network.migration_traces.filter((trace) => {
        // 기존 필터 조건: 이주 연도 범위
        const matchesYearRange =
          trace.migration_year >= yearRange[0] &&
          trace.migration_year <= yearRange[1]

        // 유저 자신이 등록한 네트워크의 트레이스 필터 조건
        const matchesUserNetworkTrace =
          !filters.userNetworkTraceFilter ||
          !user.name ||
          network.user_name === user.name

        // 이주 추적 원인 필터 조건
        const matchesMigrationReasons =
          filters.migrationReasons.includes("all") ||
          filters.migrationReasons.length === 0 ||
          filters.migrationReasons.includes(trace.reason)

        // 모든 조건을 종합적으로 확인
        return (
          matchesYearRange && matchesUserNetworkTrace && matchesMigrationReasons
        )
      }),
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

  // const migrationTraces =
  //   networks?.map((network) => network.migration_traces) ?? []

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
      setFocusedNode({ id: id, lat: entity.latitude, lng: entity.longitude })
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

  const handleMigrationTraceClick = (networkId: number) => {
    setSelectedMigrationNetworkId(
      (prev) => (prev === networkId ? null : networkId), // 같은 네트워크를 클릭하면 원상복귀
    )
  }

  const handleEdgeClick = (edgeId: number) => {
    setSelectedEdgeId((prev) => (prev === edgeId ? null : edgeId)) // 엣지 토글

    // 선택된 엣지의 타겟 네트워크를 강제로 포함
    const targetNetwork = networks?.find((network) =>
      network.edges.some((edge) => edge.targetId === edgeId),
    )

    if (targetNetwork) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        forceIncludeNetworkIds: [
          ...(prevFilters.forceIncludeNetworkIds || []),
          targetNetwork.id,
        ],
      }))
    }
  }

  const handleNetworkEdgesToggle = (networkId: number) => {
    setSelectedNetworkId((prev) => (prev === networkId ? null : networkId)) // 같은 네트워크를 클릭하면 토글
  }

  // Update getEntityById function
  const getEntityById = (id: number) => {
    return networks?.find((n) => n.id === id) || null
  }

  const getConnectionColor = (type: Network["edges"][number]["edgeType"]) => {
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
      ;(network.edges || []).forEach((edge) => {
        const isEdgeSelected = selectedEdgeId
          ? edge.targetId === selectedEdgeId
          : true

        const isNetworkSelected = selectedNetworkId
          ? network.id === selectedNetworkId
          : true

        const matchesEdgeType =
          filters.edgeType.includes("all") ||
          filters.edgeType.includes(edge.edgeType)

        const matchesYearRange =
          Number(edge.year) >= Number(filters.yearRange[0]) &&
          Number(edge.year) <= Number(filters.yearRange[1])

        if (
          isEdgeSelected &&
          isNetworkSelected &&
          matchesEdgeType &&
          matchesYearRange
        ) {
          const target = networks?.find((n) => n.id === edge.targetId)

          // 유저 네트워크 커넥션 필터 조건
          const matchesUserNetworkConnection =
            !filters.userNetworkConnectionFilter ||
            !user.name ||
            network.user_name === user.name ||
            (target && target.user_name === user.name)

          if (target && matchesUserNetworkConnection) {
            edges.push([
              [network.latitude, network.longitude],
              [target.latitude, target.longitude],
              getConnectionColor(edge.edgeType),
              edge.strength,
              edge.edgeType,
              edge.year,
            ])
          }
        }
      })
    }

    networks?.forEach((network) => {
      const migration_year = new Date(network.migration_year)

      if (
        (filters.entityType.includes("all") ||
          filters.entityType.includes(network.type)) &&
        (filters.nationality.includes("all") ||
          filters.nationality.includes(network.nationality)) &&
        (filters.ethnicity.includes("all") ||
          filters.ethnicity.includes(network.ethnicity)) &&
        migration_year.getFullYear() >= filters.yearRange[0] &&
        migration_year.getFullYear() <= filters.yearRange[1]
      ) {
        addEdges(network)
      }
    })

    return edges
  }

  // 3D 전용 getEdges 함수
  const getEdgesFor3D = () => {
    const edges: any[] = []

    networks?.forEach((network) => {
      ;(network.edges || []).forEach((edge) => {
        const matchesEdgeType =
          filters.edgeType.includes("all") ||
          filters.edgeType.includes(edge.edgeType)

        const matchesYearRange =
          Number(edge.year) >= Number(filters.yearRange[0]) &&
          Number(edge.year) <= Number(filters.yearRange[1])

        if (matchesEdgeType && matchesYearRange) {
          const target = networks.find((n) => n.id === edge.targetId)
          if (target) {
            edges.push({
              startLat: network.latitude,
              startLon: network.longitude,
              endLat: target.latitude,
              endLon: target.longitude,
              edgeType: edge.edgeType,
              year: edge.year,
            })
          }
        }
      })
    })

    return edges
  }

  const handleFilterChange = (
    key: keyof FilterOptions,
    value: boolean | string | string[] | number[],
  ) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, [key]: value }

      // 필터링 조건이 초기화되었을 때 다시 계산
      if (key === "nationality" && Array.isArray(value) && value.length === 0) {
        updatedFilters.nationality = ["all"]
      }
      if (key === "ethnicity" && Array.isArray(value) && value.length === 0) {
        updatedFilters.ethnicity = ["all"]
      }
      if (key === "edgeType" && Array.isArray(value) && value.length === 0) {
        updatedFilters.edgeType = ["all"]
      }
      if (key === "entityType" && Array.isArray(value) && value.length === 0) {
        updatedFilters.entityType = ["all"]
      }

      return updatedFilters
    })
  }

  const filteredNetworks = networks
    ? networks.filter((network) => {
        // 선택된 엣지와 관련된 네트워크만 포함
        if (selectedEdgeId) {
          const isEdgeTarget = network.edges.some(
            (edge) => edge.targetId === selectedEdgeId,
          )
          if (isEdgeTarget) {
            return true
          }
        }

        // 강제로 포함된 네트워크는 항상 포함
        const isForcedIncluded = filters.forceIncludeNetworkIds?.includes(
          network.id,
        )

        // 기존 필터 조건
        const matchesNationality =
          filters.nationality.includes("all") ||
          filters.nationality.includes(network.nationality)
        const matchesEthnicity =
          filters.ethnicity.includes("all") ||
          filters.ethnicity.includes(network.ethnicity)
        const matchesYearRange =
          network.migration_year >= filters.yearRange[0] &&
          network.migration_year <= filters.yearRange[1]

        // 새로 추가된 유저 이름 필터
        const matchesUserNetwork =
          !filters.userNetworkFilter ||
          !user.name ||
          network.user_name === user.name

        // 엔티티 유형 필터 조건
        const matchesEntityType =
          filters.entityType.includes("all") ||
          filters.entityType.includes(network.type)

        // 모든 필터 조건을 종합적으로 확인
        return (
          isForcedIncluded || // 강제로 포함된 네트워크는 항상 포함
          (matchesNationality &&
            matchesEthnicity &&
            matchesYearRange &&
            matchesUserNetwork &&
            matchesEntityType)
        )
      })
    : []

  const filteredNetworkTraces = networks
    ? networks.filter((network) => {
        // 기존 필터 조건
        const matchesNationality =
          filters.nationality === "all" ||
          network.nationality === filters.nationality
        const matchesEthnicity =
          filters.ethnicity === "all" || network.ethnicity === filters.ethnicity
        const matchesYearRange =
          network.migration_year >= filters.yearRange[0] &&
          network.migration_year <= filters.yearRange[1]

        // 새로 추가된 유저 이름 필터
        const matchesUserNetwork =
          !filters.userNetworkFilter ||
          !user.name ||
          network.user_name === user.name

        // 모든 필터 조건을 종합적으로 확인
        return (
          matchesNationality &&
          matchesEthnicity &&
          matchesYearRange &&
          matchesUserNetwork
        )
      })
    : []

  // const uniqueNationalities = Array.from(
  //   new Set(filteredNetworks.map((m) => m.nationality)),
  // )
  // const uniqueEthnicities = Array.from(
  //   new Set(filteredNetworks.map((m) => m.ethnicity)),
  // )
  // const uniqueConnectionTypes = Array.from(
  //   new Set(networks?.flatMap((m) => m.connections.map((c) => c.type))),
  // )

  const entityOptions = Array.from(new Set(networks?.map((m) => m.type))).map(
    (type) => ({
      value: type,
      label: type,
    }),
  )

  const nationalityOptions = Array.from(
    new Set(networks?.map((m) => m.nationality)),
  ).map((nationality) => ({
    value: nationality,
    label: nationality,
  }))

  const ethnicityOptions = Array.from(
    new Set(networks?.map((m) => m.ethnicity)),
  ).map((ethnicity) => ({
    value: ethnicity,
    label: ethnicity,
  }))

  const edgeTypeOptions = Array.from(
    new Set(
      (networks || []).flatMap((m) => (m.edges || []).map((c) => c.edgeType)),
    ),
  ).map((type) => ({
    value: type,
    label: type,
  }))

  const migrationReasonOptions = Array.from(
    new Set(
      networks?.flatMap((network) =>
        network.migration_traces.map((trace) => trace.reason),
      ),
    ),
  ).map((reason) => ({
    value: reason,
    label: reason,
  }))

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
      ;(connectionsMap[current] || []).forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          distances[neighbor] = dist + 1
          queue.push([neighbor, dist + 1])
        }
      })
    }

    return distances
  }

  const centralityValues = calculateCentrality(networks ?? [], centralityType)

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

  const getNodeSize = (centrality: number, centralityType: string) => {
    let baseSize = 10
    let scaleFactor = 2

    if (centralityType === "degree") {
      scaleFactor = 1
    } else if (
      centralityType === "closeness" ||
      centralityType === "eigenvector"
    ) {
      scaleFactor = 10
    } else if (centralityType === "betweenness") {
      scaleFactor = 50
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
        migration_traces: [],
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

  const handleTooltipOpen = async (id: number) => {
    fetchComments(id)

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/networks/photo/${id}`,
        {
          responseType: "blob",
        },
      )
      const imageUrl = URL.createObjectURL(response.data)
      setHighlightedNode({
        id,
        photo: imageUrl,
      })
    } catch (error) {
      console.error("Error fetching photo:", error)
      setHighlightedNode({
        id,
        photo: "",
      })
    }
  }

  const CustomMapComponent = () => {
    const map = useMap()
    const [activeTooltip, setActiveTooltip] = useState<L.Tooltip | null>(null)
    const [edgeLayer, setEdgeLayer] = useState<L.LayerGroup | null>(null)

    // `getEdges` 결과를 캐싱
    const edges = useMemo(() => getEdges(), [filters, networks])

    useEffect(() => {
      if (edgeLayer) {
        edgeLayer.clearLayers()
        edgeLayer.remove()
      }

      const newEdgeLayer = L.layerGroup().addTo(map)
      setEdgeLayer(newEdgeLayer)

      edges.forEach((edge) => {
        const positions = edge.slice(0, 2) as LatLngExpression[]
        const color = "#8B4513" // 선 색상 (SaddleBrown)
        const arrowColor = "#DAA520" // 화살표 색상 (GoldenRod)
        const opacity = (edge[3] as number) * 0.16 + 0.2
        const edgeType = edge[4] as string
        const connectionStrength = edge[3] as number
        const connectionYear = edge[5] as number

        // Polyline 생성
        const leafletPolyline = L.polyline(positions, {
          color: color,
          weight: 2,
          opacity: opacity,
        }).addTo(newEdgeLayer)

        // 화살표 추가
        const decorator = L.polylineDecorator(leafletPolyline, {
          patterns: [
            {
              offset: "50%", // 화살표 위치
              repeat: 0, // 반복 없음
              symbol: L.Symbol.arrowHead({
                pixelSize: 10, // 화살표 크기
                polygon: true,
                pathOptions: { color: arrowColor, fillOpacity: 1, weight: 0 },
              }),
            },
          ],
        }).addTo(newEdgeLayer)

        const tooltipContent = `<span>${t("connectionType")}: ${t(
          edgeType,
        )}<br/>${t("connectionStrength")}: ${connectionStrength}<br/>${t(
          "connectionYear",
        )}: ${connectionYear}</span>`

        leafletPolyline.bindTooltip(tooltipContent, {
          permanent: false,
          direction: "top",
          opacity: 0.9,
        })

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

        leafletPolyline.on("dblclick", () => {
          if (activeTooltip) {
            activeTooltip.remove()
            setActiveTooltip(null)
          }
        })
      })

      return () => {
        if (newEdgeLayer) {
          newEdgeLayer.clearLayers()
          newEdgeLayer.remove()
        }
      }
    }, [map, edges, activeTooltip])

    return null
  }

  const HandleMapClick = () => {
    useMapEvents({
      click: () => {
        setHighlightedNode(null) // 지도 클릭 시 하이라이트 해제
      },
    })
    return null
  }

  const getMigrationTraces = () => {
    const tracesByNetwork: { [key: number]: any[] } = {}

    networks?.forEach((network) => {
      // 특정 네트워크가 선택된 경우, 해당 네트워크의 마이그레이션 트레이스만 추가
      if (
        !selectedMigrationNetworkId || // 선택된 네트워크가 없거나
        network.id === selectedMigrationNetworkId // 선택된 네트워크와 일치하는 경우
      ) {
        network.migration_traces.forEach((trace) => {
          if (!tracesByNetwork[network.id]) {
            tracesByNetwork[network.id] = []
          }
          tracesByNetwork[network.id].push(trace)
        })
      }
    })

    return Object.values(tracesByNetwork)
      .map((traces) =>
        traces.sort((a, b) => a.migration_year - b.migration_year),
      )
      .filter((traces) => {
        // 기존 필터 조건 적용
        const matchesYearRange = traces.some(
          (trace) =>
            trace.migration_year >= yearRange[0] &&
            trace.migration_year <= yearRange[1],
        )

        const matchesUserNetworkTrace =
          !filters.userNetworkTraceFilter ||
          !user.name ||
          networks?.some(
            (network) =>
              network.id === traces[0].network_id &&
              network.user_name === user.name,
          )

        const matchesMigrationReasons =
          filters.migrationReasons.includes("all") ||
          filters.migrationReasons.length === 0 ||
          traces.some((trace) =>
            filters.migrationReasons.includes(trace.reason),
          )

        return (
          matchesYearRange && matchesUserNetworkTrace && matchesMigrationReasons
        )
      })
      .map((traces) =>
        traces.filter(
          (trace) =>
            trace.migration_year >= yearRange[0] &&
            trace.migration_year <= yearRange[1] &&
            (filters.migrationReasons.includes("all") ||
              filters.migrationReasons.length === 0 ||
              filters.migrationReasons.includes(trace.reason)),
        ),
      )
  }
  const migrationTraces = getMigrationTraces()

  return (
    <div className="h-[calc(87vh-64px)] relative">
      <div className="p-2 bg-[#d1c6b1] relative w-full">
        {isMobile ? (
          <MobileCarousel {...sliderSettings}>
            {/* 개체 필터 */}
            <div>
              <Select
                options={entityOptions}
                onChange={(entityOptions) =>
                  handleFilterChange(
                    "entityType",
                    entityOptions
                      ? entityOptions.map((option) => option.value)
                      : ["all"],
                  )
                }
                placeholder={t("allEntityTypes")}
                isClearable
                isMulti
                styles={customStyles}
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 국적 필터 */}
            <div>
              <Select
                options={nationalityOptions}
                onChange={(selectedOptions) =>
                  handleFilterChange(
                    "nationality",
                    selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : ["all"],
                  )
                }
                placeholder={t("allNationalities")}
                isClearable
                isMulti
                styles={customStyles}
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 민족 필터 */}
            <div>
              <Select
                options={ethnicityOptions}
                onChange={(selectedOptions) =>
                  handleFilterChange(
                    "ethnicity",
                    selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : ["all"],
                  )
                }
                placeholder={t("allEthnicities")}
                isClearable
                isMulti
                styles={customStyles}
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 관계 필터 */}
            <div>
              <Select
                options={edgeTypeOptions}
                onChange={(selectedOptions) =>
                  handleFilterChange(
                    "edgeType",
                    selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : ["all"],
                  )
                }
                placeholder={t("allConnectionTypes")}
                isClearable
                isMulti
                styles={customStyles}
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 이동 필터 */}
            <div>
              <Select
                options={migrationReasonOptions}
                onChange={(selectedOptions) =>
                  handleFilterChange(
                    "migrationReasons",
                    selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : ["all"],
                  )
                }
                placeholder={t("allMigrationReasons")}
                isClearable
                isMulti
                styles={customStyles}
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 중심성 필터 */}
            <div>
              <Select
                options={[
                  { value: "none", label: t("selectCentrality") },
                  { value: "degree", label: t("degreeCentrality") },
                  { value: "betweenness", label: t("betweenessCentrality") },
                  { value: "closeness", label: t("closenessCentrality") },
                  { value: "eigenvector", label: t("eigenvectorCentrality") },
                ]}
                onChange={(selectedOption) =>
                  setCentralityType(
                    selectedOption ? selectedOption.value : "none",
                  )
                }
                value={{
                  value: centralityType,
                  label: t(
                    centralityType === "none"
                      ? "selectCentrality"
                      : `${centralityType}Centrality`,
                  ),
                }}
                placeholder={t("selectCentrality")}
                styles={customStyles}
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 관계 연도 */}
            <div>
              <div className="p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]">
                <label className="text-sm">{t("yearRange")}</label>
                <input
                  type="number"
                  placeholder="1800"
                  value={filters.yearRange[0]}
                  onChange={(e) =>
                    handleFilterChange("yearRange", [
                      parseInt(e.target.value),
                      filters.yearRange[1],
                    ])
                  }
                  className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-sm">-</span>
                <input
                  type="number"
                  placeholder="2024"
                  value={filters.yearRange[1]}
                  onChange={(e) =>
                    handleFilterChange("yearRange", [
                      filters.yearRange[0],
                      parseInt(e.target.value),
                    ])
                  }
                  className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* 이동 연도 */}
            <div>
              <div className="p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]">
                <label className="text-sm">{t("migrationTraceability")}</label>
                <input
                  type="number"
                  value={yearRange[0] === 0 ? "" : yearRange[0]}
                  placeholder="1800"
                  onFocus={() => {
                    if (yearRange[0] === 0) {
                      setYearRange([0, yearRange[1]])
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      setYearRange([0, yearRange[1]])
                    }
                  }}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : parseInt(e.target.value)
                    setYearRange([value, yearRange[1]])
                  }}
                  className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-sm">-</span>
                <input
                  type="number"
                  placeholder="2024"
                  value={yearRange[1] === 0 ? "" : yearRange[1]}
                  onFocus={() => {
                    if (yearRange[1] === 0) {
                      setYearRange([yearRange[0], 0])
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      setYearRange([yearRange[0], 0])
                    }
                  }}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : parseInt(e.target.value)
                    setYearRange([yearRange[0], value])
                  }}
                  className="w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* 나의 노드 */}
            <div>
              <div className="p-1 border rounded bg-[#d1c6b1] flex items-center border-2 border-[#9e9d89]">
                <input
                  type="checkbox"
                  id="userNetworkFilter"
                  className="w-4 h-4"
                  checked={filters.userNetworkFilter}
                  onChange={(e) =>
                    handleFilterChange("userNetworkFilter", e.target.checked)
                  }
                />
                <label htmlFor="userNetworkFilter" className="ml-2 text-sm">
                  {t("filterByUserNetwork")}
                </label>
              </div>
            </div>

            {/* 나의 이동 */}
            <div>
              <div className="p-1 border rounded bg-[#d1c6b1] flex items-center border-2 border-[#9e9d89]">
                <input
                  type="checkbox"
                  id="userNetworkTraceFilter"
                  className="w-4 h-4"
                  checked={filters.userNetworkTraceFilter}
                  onChange={(e) =>
                    handleFilterChange(
                      "userNetworkTraceFilter",
                      e.target.checked,
                    )
                  }
                />
                <label
                  htmlFor="userNetworkTraceFilter"
                  className="ml-2 text-sm"
                >
                  {t("filterByUserNetworkTrace")}
                </label>
              </div>
            </div>

            {/* 나의 관계망 */}
            <div>
              <div className="p-1 border rounded bg-[#d1c6b1] flex items-center border-2 border-[#9e9d89]">
                <input
                  type="checkbox"
                  id="userNetworkConnectionFilter"
                  className="w-4 h-4"
                  checked={filters.userNetworkConnectionFilter}
                  onChange={(e) =>
                    handleFilterChange(
                      "userNetworkConnectionFilter",
                      e.target.checked,
                    )
                  }
                />
                <label
                  htmlFor="userNetworkConnectionFilter"
                  className="ml-2 text-sm"
                >
                  {t("filterByUserNetworkConnection")}
                </label>
              </div>
            </div>

            {/* 검색란 */}
            <div>
              <div className="p-1 border rounded bg-[#d1c6b1] flex items-center border-2 border-[#9e9d89]">
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
                  className="w-full p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleSearchClick}
                  className="ml-2 px-4 py-1 bg-amber-700 text-white rounded hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {t("search")}
                </button>
              </div>
            </div>
          </MobileCarousel>
        ) : (
          <SwipeableContainer isVisible={isFiltersVisible}>
            {/* 3D 모드 전환 버튼 추가 */}
            <ThreeDButton onClick={toggle3DMode}>
              {is3DMode ? "2D" : "3D"}
            </ThreeDButton>
            {/* Entity Filters */}
            <div className="p-1 border rounded bg-[#d1c6b1] flex flex-wrap gap-1 items-center border-2 border-[#9e9d89]">
              <FilterContainer>
                <Select
                  options={entityOptions}
                  onChange={(entityOptions) =>
                    handleFilterChange(
                      "entityType",
                      entityOptions
                        ? entityOptions.map((option) => option.value)
                        : ["all"],
                    )
                  }
                  placeholder={t("allEntityTypes")}
                  isClearable
                  isMulti
                  styles={customStyles}
                  className={`p-1 rounded text-sm ${
                    user.isLoggedIn ? "w-30" : "w-42"
                  } h-9 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
                <Select
                  options={nationalityOptions}
                  onChange={(selectedOptions) =>
                    handleFilterChange(
                      "nationality",
                      selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : ["all"],
                    )
                  }
                  placeholder={t("allNationalities")}
                  isClearable
                  isMulti
                  styles={customStyles}
                  className={`p-1 rounded text-sm ${
                    user.isLoggedIn ? "w-30" : "w-42"
                  } h-9 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
                <Select
                  options={ethnicityOptions}
                  onChange={(selectedOptions) =>
                    handleFilterChange(
                      "ethnicity",
                      selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : ["all"],
                    )
                  }
                  placeholder={t("allEthnicities")}
                  isClearable
                  isMulti
                  styles={customStyles}
                  className={`p-1 rounded text-sm ${
                    user.isLoggedIn ? "w-30" : "w-42"
                  } h-9 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />

                <Select
                  options={edgeTypeOptions}
                  onChange={(selectedOptions) =>
                    handleFilterChange(
                      "edgeType",
                      selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : ["all"],
                    )
                  }
                  value={
                    Array.isArray(filters.edgeType)
                      ? filters.edgeType
                          .filter((value) => value !== "all")
                          .map((value) => ({
                            value,
                            label: value,
                          }))
                      : []
                  }
                  placeholder={t("allConnectionTypes")}
                  isClearable
                  isMulti
                  styles={customStyles}
                  className={`p-1 rounded text-sm ${
                    user.isLoggedIn ? "w-30" : "w-42"
                  } h-9 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
                <Select
                  options={migrationReasonOptions}
                  onChange={(selectedOptions) =>
                    handleFilterChange(
                      "migrationReasons",
                      selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : ["all"],
                    )
                  }
                  placeholder={t("allMigrationReasons")}
                  isClearable
                  isMulti
                  styles={customStyles}
                  className={`p-1 rounded text-sm ${
                    user.isLoggedIn ? "w-30" : "w-42"
                  } h-9 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
                {/* Centrality */}
                {user.isLoggedIn ? (
                  <Select
                    options={[
                      { value: "none", label: t("selectCentrality") },
                      { value: "degree", label: t("degreeCentrality") },
                      {
                        value: "betweenness",
                        label: t("betweenessCentrality"),
                      },
                      { value: "closeness", label: t("closenessCentrality") },
                      {
                        value: "eigenvector",
                        label: t("eigenvectorCentrality"),
                      },
                    ]}
                    onChange={(selectedOption) =>
                      setCentralityType(
                        selectedOption ? selectedOption.value : "none",
                      )
                    }
                    value={{
                      value: centralityType,
                      label: t(
                        centralityType === "none"
                          ? "selectCentrality"
                          : `${centralityType}Centrality`,
                      ),
                    }}
                    placeholder={t("selectCentrality")}
                    styles={customStyles}
                    className={`p-1 rounded text-sm ${
                      user.isLoggedIn ? "w-30" : "w-42"
                    } h-9 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  />
                ) : (
                  <></>
                )}
                {/* 숨기기/보이기 버튼 */}
                <ToggleButton onClick={toggleFilters}>
                  {isFiltersVisible ? "▼" : "▲"}
                </ToggleButton>
              </FilterContainer>
            </div>

            {/* Year Range */}
            <div className="p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]">
              <label className="text-sm">{t("yearRange")}</label>
              <input
                type="number"
                placeholder="1800"
                value={filters.yearRange[0]}
                onChange={(e) =>
                  handleFilterChange("yearRange", [
                    parseInt(e.target.value),
                    filters.yearRange[1],
                  ])
                }
                className={`w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  user.isLoggedIn ? "w-14" : "w-22"
                }`}
              />
              <span className="text-sm">-</span>
              <input
                type="number"
                placeholder="2024"
                value={filters.yearRange[1]}
                onChange={(e) =>
                  handleFilterChange("yearRange", [
                    filters.yearRange[0],
                    parseInt(e.target.value),
                  ])
                }
                className={`w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  user.isLoggedIn ? "w-14" : "w-22"
                }`}
              />
            </div>

            {/* Migration Traceability */}
            <div className="p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]">
              <label className="text-sm">{t("migrationTraceability")}</label>
              <input
                type="number"
                value={yearRange[0] === 0 ? "" : yearRange[0]} // 0이면 빈 문자열로 표시
                placeholder="1800"
                onFocus={() => {
                  // 포커스 시 값이 0이면 빈 문자열로 변환
                  if (yearRange[0] === 0) {
                    setYearRange([0, yearRange[1]])
                  }
                }}
                onBlur={(e) => {
                  // 블러 시 빈 문자열이면 0으로 변환
                  if (e.target.value === "") {
                    setYearRange([0, yearRange[1]])
                  }
                }}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : parseInt(e.target.value)
                  setYearRange([value, yearRange[1]])
                }}
                className={`w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  user.isLoggedIn ? "w-14" : "w-22"
                }`}
              />
              <span className="text-sm">-</span>
              <input
                type="number"
                placeholder="2024"
                value={yearRange[1] === 0 ? "" : yearRange[1]} // 0이면 빈 문자열로 표시
                onFocus={() => {
                  // 포커스 시 값이 0이면 빈 문자열로 변환
                  if (yearRange[1] === 0) {
                    setYearRange([yearRange[0], 0])
                  }
                }}
                onBlur={(e) => {
                  // 블러 시 빈 문자열이면 0으로 변환
                  if (e.target.value === "") {
                    setYearRange([yearRange[0], 0])
                  }
                }}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : parseInt(e.target.value)
                  setYearRange([yearRange[0], value])
                }}
                className={`w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  user.isLoggedIn ? "w-14" : "w-22"
                }`}
              />
            </div>

            {user.isLoggedIn ? (
              <>
                {/* Search */}
                <div className="p-1 border rounded bg-[#d1c6b1] flex gap-0.5 items-center border-2 border-[#9e9d89]">
                  <div className="ml-1 flex items-center gap-0.5">
                    <input
                      type="checkbox"
                      id="userNetworkFilter"
                      className="w-2 h-2"
                      checked={filters.userNetworkFilter}
                      defaultChecked={false} // 초기값으로 체크되어있지 않게 설정
                      onChange={(e) =>
                        handleFilterChange(
                          "userNetworkFilter",
                          e.target.checked,
                        )
                      }
                    />
                    <label htmlFor="userNetworkFilter" className="text-xs">
                      {t("filterByUserNetwork")}
                    </label>
                  </div>
                  <div className="ml-1 flex items-center gap-0.5">
                    <input
                      type="checkbox"
                      id="userNetworkTraceFilter"
                      className="w-2 h-2"
                      checked={filters.userNetworkTraceFilter}
                      defaultChecked={false} // 초기값으로 체크되어있지 않게 설정
                      onChange={(e) =>
                        handleFilterChange(
                          "userNetworkTraceFilter",
                          e.target.checked,
                        )
                      }
                    />
                    <label htmlFor="userNetworkTraceFilter" className="text-xs">
                      {t("filterByUserNetworkTrace")}
                    </label>
                  </div>
                  <div className="ml-1 flex items-center gap-0.5">
                    <input
                      type="checkbox"
                      id="userNetworkConnectionFilter"
                      className="w-2 h-2"
                      checked={filters.userNetworkConnectionFilter}
                      defaultChecked={false} // 초기값으로 체크되어있지 않게 설정
                      onChange={(e) =>
                        handleFilterChange(
                          "userNetworkConnectionFilter",
                          e.target.checked,
                        )
                      }
                    />
                    <label
                      htmlFor="userNetworkConnectionFilter"
                      className="text-xs"
                    >
                      {t("filterByUserNetworkConnection")}
                    </label>
                  </div>
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
                    className="w-36 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleSearchClick}
                    className="px-4 py-1 bg-amber-700 text-white rounded hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              </>
            ) : (
              <></>
            )}
          </SwipeableContainer>
        )}
        {/* Render Search Results */}
        {triggerSearch && searchQuery && (
          <div
            className="flex justify-end absolute w-full border border-gray-300 w-full max-h-80 overflow-y-auto z-10"
            style={{
              top: "4rem",
              right: "0",
              zIndex: 1,
              opacity: 0.95, // 투명도 조정 (0은 완전 투명, 1은 완전 불투명)
            }}
          >
            <div
              className="bg-white shadow rounded p-4 border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10"
              style={{
                maxWidth: "50%",
                width: "fit-content",
                zIndex: 1,
                position: "relative",
                opacity: 0.95, // 검색 결과의 투명도 설정
                backgroundColor: "rgba(255, 255, 255, 0.8)", // 배경에 투명도 적용 (배경 색상: 흰색, 투명도 0.8)
              }}
            >
              <SearchResults
                searchQuery={searchQuery}
                setFocusedNode={setFocusedNode}
                handleEntityClick={handleEntityClick}
                handleMigrationTraceClick={handleMigrationTraceClick} // 추가
                handleEdgeClick={handleEdgeClick}
                handleNetworkEdgesToggle={handleNetworkEdgesToggle}
              />
            </div>
          </div>
        )}
      </div>
      {/* 3D 모드와 2D 모드 전환 */}
      {is3DMode ? (
        <ThreeDMap
          networks={networks}
          filters={filters}
          filteredNetworks={filteredNetworks}
          filteredTraces={filteredTraces}
          filteredEdges={getEdgesFor3D()}
          handleEdgeClick={handleEdgeClick}
          handleNetworkEdgesToggle={handleNetworkEdgesToggle}
        />
      ) : (
        <MapContainer
          center={[37.5665, 126.978]}
          zoom={2}
          style={{
            height: "calc(100vh - 64px - 64px)", // 64px for header and 64px for footer
            width: "100%",
            position: "relative",
            zIndex: 0,
          }}
          maxBounds={[
            [90, -360], // 최소 위도, 경도
            [-90, 360], // 최대 위도, 경도
          ]}
          maxBoundsViscosity={1.0} // 최대 경계 범위 조정
          minZoom={3} // 최소 줌 레벨 설정
        >
          <HandleRightClick />
          <HandleMapClick /> {/* 지도 클릭 시 하이라이트 해제 */}
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
          {/* 지도에 표시될 네트워크 데이터 */}
          {filteredNetworks.map((network) => {
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
              color = "orange"
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
                eventHandlers={{
                  click: () => handleTooltipOpen(network.id),
                  // mouseout: () => setHighlightedNode(null), // 마우스를 떼면 하이라이트 해제
                }}
              >
                <Popup>
                  <div className="p-4 max-w-xl max-h-[500px] overflow-y-auto">
                    {" "}
                    {/* 팝업 크기를 제한 */}
                    <strong className="text-lg font-semibold block mb-2">
                      No.{network.id} : {network.title}
                    </strong>
                    <div className="text-gray-700 text-sm space-y-1">
                      {highlightedNode?.id === network.id &&
                        highlightedNode.photo && (
                          <div className="flex justify-center mb-2">
                            <img
                              src={highlightedNode.photo}
                              alt="Network"
                              className="w-24 h-24 object-cover rounded-lg shadow-md"
                            />
                          </div>
                        )}
                      <p>
                        <span className="font-medium">Creator Name:</span>{" "}
                        {userNames[network.user_id]}
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
                        <span className="font-medium">
                          {network.type === "Migrant"
                            ? "Birth Year"
                            : "Established Year"}
                        </span>
                        <span className="font-medium">
                          : {network.migration_year}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">
                          {network.type === "Migrant"
                            ? "Death Year"
                            : "Dissolved Year"}
                        </span>
                        <span className="font-medium">
                          : {network.end_year}
                        </span>
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
                  {/* 코멘트 섹션을 스크롤 가능한 영역으로 제한 */}
                  <div className="max-h-32 max-w-full overflow-y-auto border-t pt-2">
                    <CommentSection networkId={network.id} />
                  </div>
                </Popup>
              </Marker>
            )
          })}
          <CustomMapComponent /> {/* MapContainer 내부에 위치시킴 */}
          {filteredTraces.map(
            (trace: {
              reason: string
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
              <CircleMarker
                key={trace.id}
                center={[trace.latitude, trace.longitude]}
                radius={6}
                color="#BF360C" // 테두리 색상
                fillColor="#FF5722" // 채우기 색상
                fillOpacity={0.7} // 투명도
              >
                {" "}
                <Popup>
                  <div
                    style={{
                      fontSize: "18px",
                      lineHeight: "1.6",
                      margin: "0",
                      padding: "0",
                    }}
                  >
                    <div>
                      <strong>Network ID:</strong> {trace.network_id}
                    </div>
                    <div>
                      <strong>Place:</strong> {trace.location_name}
                    </div>
                    <div>
                      <strong>Migration Year:</strong> {trace.migration_year}
                    </div>
                    <div>
                      <strong>Reason:</strong> {trace.reason}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ),
          )}
          {migrationTraces.map((traces) =>
            traces.slice(0, -1).map((trace, index) => {
              const nextTrace = traces[index + 1]
              return (
                <Polyline
                  key={`${trace.id}-${nextTrace.id}`}
                  positions={[
                    [trace.latitude, trace.longitude],
                    [nextTrace.latitude, nextTrace.longitude],
                  ]}
                  color="#3E2723" // 이주 추적성을 구분하기 위해 색상을 다르게 설정
                  weight={3}
                  opacity={0.7}
                  dashArray="5, 5"
                  lineCap="round"
                  lineJoin="round"
                  eventHandlers={{
                    click: (e) => {
                      L.popup()
                        .setLatLng(e.latlng)
                        .setContent(
                          `<div>
                  <strong>Network ID:</strong> ${nextTrace.network_id}<br/>
                  <strong>Migration Year:</strong> ${nextTrace.migration_year}<br/>
                  <strong>Location Name:</strong> ${nextTrace.location_name}<br/>
                  <strong>Reason:</strong> ${nextTrace.reason}
                </div>`,
                        )
                        .openOn(e.target._map)
                    },
                  }}
                />
              )
            }),
          )}
          {migrationTraces.map((traces) =>
            traces.slice(0, -1).map((trace, index) => {
              const nextTrace = traces[index + 1]

              // 데이터 검증: trace와 nextTrace가 유효한지 확인
              if (
                !trace ||
                !nextTrace ||
                !trace.latitude ||
                !trace.longitude ||
                !nextTrace.latitude ||
                !nextTrace.longitude
              ) {
                console.warn("Invalid trace data:", { trace, nextTrace })
                return null
              }
              return <MigrationTraceDecorator traces={migrationTraces.flat()} />
            }),
          )}
        </MapContainer>
      )}
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

const customStyles = {
  control: (
    provided: { boxShadow: any; borderColor: any },
    state: { isFocused: any },
  ) => ({
    ...provided,
    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(251, 191, 36, 1)"
      : provided.boxShadow,
    borderColor: state.isFocused
      ? "rgba(251, 191, 36, 1)"
      : provided.borderColor,
    "&:hover": {
      borderColor: state.isFocused
        ? "rgba(251, 191, 36, 1)"
        : provided.borderColor,
    },
    borderRadius: "0.375rem", // 둥근 테두리
    minWidth: "120px", // 최소 너비 설정
    maxWidth: "200px", // 최대 너비 설정
    whiteSpace: "nowrap", // 텍스트 줄바꿈 방지
    overflow: "hidden", // 텍스트가 넘칠 경우 숨김
    textOverflow: "ellipsis", // 넘친 텍스트에 말줄임표 추가
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "black", // 플레이스홀더 글자 색깔
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "black", // 선택된 값의 글자 색깔
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "black", // 멀티 셀렉트 텍스트 색깔
  }),
}

// 추가: 필터 버튼 컨테이너 스타일
const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr); // 데스크톱에서는 3열 고정
  gap: 0.2rem; // 버튼 간격

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr); // 모바일에서 2열로 변경
    gap: 0.1rem;
  }
`
// 3D 버튼 스타일 정의
const ThreeDButton = styled.button`
  display: none; /* 기본적으로 숨김 */
  @media (min-width: 768px) {
    display: inline-block; /* 데스크톱에서는 표시 */
  }
  padding: 0.5rem 1rem;
  background-color: #3e2723;
  color: white;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5d4037;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3e2723;
  }
`

// 스와이프 가능한 컨테이너 스타일 정의
const SwipeableContainer = styled.div<{ isVisible: boolean }>`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem;
  background-color: #d1c6b1;
  border-radius: 0.375rem;
  transition: transform 0.3s ease-in-out; /* 애니메이션 효과 */
  transform: ${({ isVisible }) =>
    isVisible ? "translateY(0)" : "translateY(-100%)"}; /* 위로 숨기기 */
  position: relative;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #9e9d89;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }

  @media (max-width: 768px) {
    display: block; /* 모바일에서는 캐러셀로 변경 */
  }
`

const MobileCarousel = styled(Slider)`
  .slick-slide {
    padding: 0 5px; /* 슬라이드 간격 */

    .slick-dots {
      bottom: 30px; /* 둥근 원이 잘리지 않도록 위치 조정 */
    }

    .slick-dots li button:before {
      font-size: 30px; /* 둥근 원 크기 조정 */
    }
  }
`

// 숨기기/보이기 버튼 스타일 정의
const ToggleButton = styled.button`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #9e9d89;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`

export default Map
