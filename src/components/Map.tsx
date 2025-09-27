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
import ResizablePopup from "./ResizablePopup"
import {
  Organization,
  EntityType,
  Connection,
  FilterOptions,
  Network,
  CsrfToken,
} from "../types"
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
import { Legend } from "./Legend"
import { analyzeNetworkType } from "../utils/analyzeNetworkType"
import { debounce } from "lodash"
import SearchBar from "./SearchBar"
import Spinner from "./Spinner"
import YearRangeInput from "./YearRangeInput"
import MigrationYearRangeInput from "./MigrationYearRangeInput"

import { recommendConnections } from "../utils/recommendConnections"
import AIStorytelling from "./AIStorytelling"
import PolylineDecoratorWrapper from "./PolylineDecoratorWrapper"

// 중심 노드로 포커스 이동
const FocusMap = ({
  lat,
  lng,
  zoom,
}: {
  lat: number
  lng: number
  zoom?: number
}) => {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], zoom ?? map.getZoom(), {
        animate: true,
      })
    }
  }, [lat, lng, zoom, map])
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
const Map: React.FC<{ guideStep?: number }> = ({ guideStep = 1 }) => {
  const isMobile = window.innerWidth <= 768
  const { t } = useTranslation()
  const [networks, setNetworks] = useState<Network[] | undefined>()
  const [showNetworkNames, setShowNetworkNames] = useState<boolean>(false) // 네트워크 이름 표시 여부 상태 추가
  const [filters, setFilters] = useState<FilterOptions>({
    userNetworkEdgeFilter: false,
    userNetworkConnectionFilter: false,
    userNetworkTraceFilter: false,
    userNetworkFilter: false,
    networkIds: [],
    nationality: ["all"],
    ethnicity: ["all"],
    connectionType: ["all"],
    edgeType: ["all"],
    entityType: ["all"],
    yearRange: ["0001-01-01", "1945-12-31"],
    migrationYearRange: ["0001-01-01", "1945-12-31"],
    migrationReasons: ["all"],
    selectedMigrationNetworkIds: [],
    searchQuery: "",
    forceIncludeNetworkIds: [],
  }) // Ensure this is closing a valid block or function
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
  // 관계연월일 입력값 상태 (화면 즉시 반영)
  const [yearRangeInput, setYearRangeInput] = useState<[string, string]>([
    "0001-01-01",
    "1945-12-31",
  ])
  // 이동연월일 입력값 상태 (화면 즉시 반영)
  const [migrationYearRangeInput, setMigrationYearRangeInput] = useState<
    [string, string]
  >(["0001-01-01", "1945-12-31"])
  const [searchQuery, setSearchQuery] = useState("")
  const [triggerSearch, setTriggerSearch] = useState(false)
  const [is3DMode, setIs3DMode] = useState(false) // 3D 모드 상태 추가
  const [selectedMigrationNetworkIds, setSelectedMigrationNetworkIds] =
    useState<number[]>([])

  const [selectedEdgeId, setSelectedEdgeId] = useState<number | null>(null)
  const [selectedNetworkId, setSelectedNetworkId] = useState<number | null>(
    null,
  )
  const [isFiltersVisible, setIsFiltersVisible] = useState(true) // 필터 표시 여부 상태
  const [isLegendVisible, setIsLegendVisible] = useState(true) // 범례 표시 여부 상태
  const [isTopContributorsVisible, setIsTopContributorsVisible] = useState(true) // 기여자 랭킹 표시 여부 상태
  const [showMigrationReasons, setShowMigrationReasons] =
    useState<boolean>(false) // 이주 원인 표시 여부 상태 추가
  const [showEdgeDetails, setShowEdgeDetails] = useState<boolean>(false) // 엣지 세부정보 표시 여부 상태 추가
  const [popupPosition, setPopupPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const [networkAnalysis, setNetworkAnalysis] = useState<string[]>([])
  // 검색어 상태
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [workerFilteredNetworks, setWorkerFilteredNetworks] = useState<
    Network[]
  >([])
  const [workerCentrality, setWorkerCentrality] = useState<
    Record<number, number>
  >({})
  // 실제 필터에 적용되는 값은 filters.yearRange, filters.migrationYearRange
  const [step, setStep] = useState(1)
  const pacificCenter = { lat: 30, lng: 170, zoom: 3 } // 태평양 중앙 좌표와 줌
  const [mapZoom, setMapZoom] = useState(5) // 기본 줌
  const [appliedGuideStep, setAppliedGuideStep] = useState<number | null>(null)
  const [openPopups, setOpenPopups] = useState<
    {
      id: number
      position: { x: number; y: number }
      network: Network
      photo: string
    }[]
  >([])
  const [showMigrationTable, setShowMigrationTable] = useState(false)
  // 관계/이동 토글 상태 (Legend에서 제어)
  const [showRelationsOnly, setShowRelationsOnly] = useState(false)
  const [showMigrationsOnly, setShowMigrationsOnly] = useState(true)
  const [showEdgeTable, setShowEdgeTable] = useState(false)

  const handleOpenPopup = async (
    network: Network,
    position: { x: number; y: number },
  ) => {
    // 이미 열려있는지 확인
    if (openPopups.some((p) => p.id === network.id)) return
    let photo = ""
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/networks/photo/${network.id}`,
      )
      photo = response.data.photo
    } catch (e) {}
    setOpenPopups((prev) => [
      ...prev,
      { id: network.id, position, network, photo },
    ])
  }

  const handleClosePopup = (id: number) => {
    setOpenPopups((prev) => prev.filter((p) => p.id !== id))
  }

  const workerRef = useRef<Worker | null>(null)

  // 중심 이동 함수
  const focusPacific = () => {
    setFocusedNode({ id: null, lat: pacificCenter.lat, lng: pacificCenter.lng })
    setTimeout(() => {
      // MapContainer의 zoom을 직접 변경할 수 없으므로, useMap 훅을 활용한 컴포넌트로 처리
      setMapZoom(pacificCenter.zoom)
      setMapZoom(3) // 최대 줌아웃
    }, 200)
  }

  // 노드로 포커스 이동 함수
  const focusNode = (node: {
    id: number
    latitude: number
    longitude: number
  }) => {
    setFocusedNode({ id: node.id, lat: node.latitude, lng: node.longitude })
    setMapZoom(7)
  }

  // 워커 초기화 및 메시지 핸들러
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/networkWorker.js", import.meta.url),
    )
    if (workerRef.current) {
      workerRef.current.onmessage = (e) => {
        const { type, payload } = e.data
        if (type === "FILTERED_NETWORKS") setWorkerFilteredNetworks(payload)
        if (type === "CENTRALITY_RESULT") setWorkerCentrality(payload)
        if (type === "PROGRESS") {
          setProgress(payload)
        } // 진행률 반영
      }
    }
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  // 네트워크 필터링 워커로 요청
  useEffect(() => {
    if (!networks) return
    workerRef.current?.postMessage({
      type: "FILTER_NETWORKS",
      payload: {
        networks,
        filters,
        userName: user.name,
        selectedEdgeId,
      },
    })
  }, [networks, filters, user.name, selectedEdgeId])

  // 단계별 필터 자동 적용
  // 단계별 필터 자동 적용 useEffect에서만 태평양 포커싱
  useEffect(() => {
    if (!networks) return
    if (appliedGuideStep === guideStep) return // 이미 적용된 단계면 무시

    if (guideStep === 1) {
      setFilters((prev) => ({
        ...prev,
        entityType: ["Person"],
        nationality: ["all"],
        ethnicity: ["Korean"],
      }))
      setAppliedGuideStep(1)
    } else if (guideStep === 2) {
      setFilters((prev) => ({
        ...prev,
        entityType: ["Person"],
        nationality: ["Russia"],
        ethnicity: ["Korean"],
      }))
      setAppliedGuideStep(2)
    } else if (guideStep === 3) {
      const jeong = networks.find(
        (n) =>
          n.type === "Person" &&
          n.ethnicity === "Korean" &&
          n.title.includes("정재관"),
      )
      if (jeong) {
        setFilters((prev) => ({
          ...prev,
          entityType: ["Person"],
          nationality: ["all"],
          ethnicity: ["Korean"],
          searchQuery: "",
          forceIncludeNetworkIds: [
            jeong.id,
            ...(jeong.edges?.map((e) => e.targetId) || []),
          ],
        }))
        handleEntityClick(jeong.id)
        handleNetworkEdgesToggle(jeong.id)
        handleMigrationTraceClick(jeong.id)
        // 팝업 자동 오픈 추가
        handleOpenPopup(jeong, { x: jeong.latitude, y: jeong.longitude })
        setTimeout(() => {
          focusPacific() // guideStep 3에서만 태평양 포커싱
        }, 500)
        setAppliedGuideStep(3)
      }
    }
  }, [guideStep, networks, appliedGuideStep])

  // 관계연월일 입력값이 변경될 때 디바운싱 후 필터 적용
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        yearRange: yearRangeInput,
      }))
    }, 1000)
    return () => clearTimeout(handler)
  }, [yearRangeInput])

  // 이동연월일 입력값이 변경될 때 디바운싱 후 필터 적용
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        migrationYearRange: migrationYearRangeInput,
      }))
    }, 1000)
    return () => clearTimeout(handler)
  }, [migrationYearRangeInput])

  // 중심성 계산 워커로 요청
  useEffect(() => {
    workerRef.current?.postMessage({
      type: "CALCULATE_CENTRALITY",
      payload: {
        filteredNetworks: workerFilteredNetworks,
        centralityType,
      },
    })
  }, [workerFilteredNetworks, centralityType])

  // 디바운싱된 검색어 업데이트 함수
  const updateDebouncedSearchQuery = useMemo(
    () =>
      debounce((query: string) => {
        setDebouncedSearchQuery(query)
      }, 300), // 1000ms 지연
    [],
  )
  const HandleMapClickForPopupSize = () => {
    useMapEvents({
      click(e) {
        setPopupPosition({
          x: e.containerPoint.x,
          y: e.containerPoint.y,
        })
      },
    })
    return null
  }

  const toggleEdgeDetails = () => {
    setShowEdgeDetails((prev) => !prev) // 엣지 세부정보 표시/비표시 토글 함수
  }
  const toggleMigrationReasons = () => {
    setShowMigrationReasons((prev) => !prev) // 이주 원인 표시/비표시 토글 함수
  }
  const toggleNetworkNames = () => {
    setShowNetworkNames((prev) => !prev) // 토글 함수
  }
  const toggleLegendVisibility = () => {
    setIsLegendVisible(!isLegendVisible)
  }
  const toggleTopContributorsVisibility = () => {
    setIsTopContributorsVisible(!isTopContributorsVisible)
  }
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 200,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: user.isLoggedIn ? 11 : 8, // 로그인 여부에 따라 초기 슬라이드 설정
    appendDots: (dots: React.ReactNode) => (
      <div
        style={{
          position: "absolute",
          bottom: "-1.5rem", // 도트 위치를 아래로 조정
          display: "flex",
          justifyContent: "center",
          width: "100%",
          padding: "0.7rem 0", // 상하 여백 추가
        }}
      >
        <ul style={{ margin: "0", padding: "0", display: "flex" }}>{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <div
        style={{
          width: "12px",
          height: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(158, 157, 137, 0.8)", // 기본 도트 색상
          borderRadius: "50%",
          color: "#fff", // 텍스트 색상
          fontSize: "10px",
          fontWeight: "bold",
          transition: "background-color 0.3s ease",
        }}
        className={`slick-dot-${i}`} // 각 도트에 고유 클래스 추가
      >
        {i + 1} {/* 현재 슬라이드 번호 표시 */}
      </div>
    ),
    afterChange: (current) => {
      // 현재 슬라이드 변경 시 도트 색상 업데이트
      const dots = document.querySelectorAll(".slick-dots li div")
      dots.forEach((dot, index) => {
        if (index === current) {
          dot.style.backgroundColor = "#3e2723" // 활성화된 도트 색상
        } else {
          dot.style.backgroundColor = "rgba(158, 157, 137, 0.8)" // 기본 도트 색상
        }
      })
    },
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
    setNetworks(data)
  }, [data])

  useEffect(() => {
    // Simulate data fetching or rendering process
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // Adjust the timeout as needed

    return () => clearTimeout(timer)
  }, [])

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setProgress((prev) => {
  //       if (prev >= 100) {
  //         clearInterval(interval)
  //         return 100
  //       }
  //       return prev + 10 // Adjust increment as needed
  //     })
  //   }, 200) // Adjust interval duration as needed

  //   return () => clearInterval(interval)
  // }, [])

  // useEffect(() => {
  //   if (workerFilteredNetworks.length > 0) {
  //     setProgress(100)
  //   }
  // }, [workerFilteredNetworks])

  useEffect(() => {
    const markersLayer = L.layerGroup()
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
        // 연월일 비교: filters.migrationYearRange는 ['yyyy-mm-dd', 'yyyy-mm-dd'] 형태로 가정
        const startDate = filters.migrationYearRange[0]
        const endDate = filters.migrationYearRange[1]
        const matchesYearRange =
          trace.migration_year >= startDate && trace.migration_year <= endDate
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
  const handleEntityClick = async (id: number) => {
    const entity = getEntityById(id)
    if (entity) {
      let imageUrl = entity.photo || ""
      if (!imageUrl) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/networks/photo/${id}`,
          )
          imageUrl = response.data.photo
        } catch (e) {
          imageUrl = ""
        }
      }
      if (guideStep !== 3) {
        focusNode(entity)
      }
      setHighlightedNode((prev) => {
        if (prev && prev.id === id) {
          return null
        }
        return { id: id, photo: imageUrl }
      })
      setPopupPosition({ x: entity.latitude, y: entity.longitude })
      setOpenPopups((prev) => {
        if (prev.some((p) => p.id === id)) return prev
        return [...prev, { id, network: entity, photo: imageUrl }]
      })
    } else {
      console.warn(`Entity with ID ${id} not found.`)
    }
  }
  const handleMigrationTraceClick = (networkId: number) => {
    setSelectedMigrationNetworkIds((prev) =>
      prev.includes(networkId)
        ? prev.filter((id) => id !== networkId)
        : [...prev, networkId],
    )
    setFilters((prev) => ({
      ...prev,
      selectedMigrationNetworkIds: prev.selectedMigrationNetworkIds.includes(
        networkId,
      )
        ? prev.selectedMigrationNetworkIds.filter((id) => id !== networkId)
        : [...prev.selectedMigrationNetworkIds, networkId],
    }))
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
    // Defensive: flatten all migration traces and ensure network_id is present
    const allTraces = (workerFilteredNetworks || []).flatMap((n) =>
      (n.migration_traces || []).map((t) => ({ ...t, network_id: n.id })),
    )
    workerFilteredNetworks.forEach((network, netIdx) => {
      ;(network.edges || []).forEach((edge, edgeIdx) => {
        let edgeYear = "0001-01-01"
        if (typeof edge.year === "string" && edge.year.length === 10) {
          edgeYear = edge.year
        } else if (typeof edge.year === "number" && edge.year > 0) {
          edgeYear = String(edge.year).padStart(10, "0")
        }
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
          edgeYear >= filters.yearRange[0] && edgeYear <= filters.yearRange[1]
        const target = workerFilteredNetworks.find(
          (n) => n.id === edge.targetId,
        )
        const matchesUserNetworkConnection =
          !filters.userNetworkConnectionFilter ||
          !user.name ||
          network.user_name === user.name ||
          (target && target.user_name === user.name)
        // 조건 완화: target이 없어도 sourceId가 필터링된 네트워크에 있으면 표시
        if (
          isEdgeSelected &&
          isNetworkSelected &&
          matchesEdgeType &&
          matchesYearRange &&
          matchesUserNetworkConnection
        ) {
          const sourceId =
            typeof network.id === "number" ? network.id : Number(network.id)
          const targetId = edge.targetId
          const sourceTrace = findClosestTraceByYear(
            sourceId,
            edgeYear,
            allTraces,
          )
          // target이 필터링된 네트워크에 없으면 targetTrace를 null로 처리
          const targetTrace = target
            ? findClosestTraceByYear(targetId, edgeYear, allTraces)
            : null
          // sourceTrace가 있고, targetTrace가 있으면 기존대로 표시
          // targetTrace가 없으면 sourceTrace 위치만 표시 (혹은 sourceTrace와 sourceTrace로 표시)
          if (sourceTrace) {
            edges.push([
              [sourceTrace.latitude, sourceTrace.longitude],
              targetTrace
                ? [targetTrace.latitude, targetTrace.longitude]
                : [sourceTrace.latitude, sourceTrace.longitude],
              getConnectionColor(edge.edgeType),
              edge.strength,
              edge.edgeType,
              edgeYear,
              {
                sourceId,
                targetId,
                edgeType: edge.edgeType,
                edgeYear,
                sourceTraceId: sourceTrace.id,
                targetTraceId: targetTrace ? targetTrace.id : null,
              },
            ])
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
      if (
        key === "migrationReasons" &&
        Array.isArray(value) &&
        value.length === 0
      ) {
        updatedFilters.migrationReasons = ["all"]
      }
      return updatedFilters
    })
  }
  // filteredNetworks를 useMemo로 메모이제이션
  // const workerFilteredNetworks = useMemo(() => {
  //   if (!networks) return []
  //   return networks.filter((network) => {
  //     // 선택된 엣지와 관련된 네트워크만 포함
  //     if (selectedEdgeId) {
  //       const isEdgeTarget = network.edges.some(
  //         (edge) => edge.targetId === selectedEdgeId,
  //       )
  //       if (isEdgeTarget) {
  //         return true
  //       }
  //     }
  //     // 강제로 포함된 네트워크는 항상 포함
  //     const isForcedIncluded = filters.forceIncludeNetworkIds?.includes(
  //       network.id,
  //     )
  //     // 기존 필터 조건
  //     const matchesNationality =
  //       filters.nationality.includes("all") ||
  //       filters.nationality.includes(network.nationality)
  //     const matchesEthnicity =
  //       filters.ethnicity.includes("all") ||
  //       filters.ethnicity.includes(network.ethnicity)
  //     const matchesYearRange =
  //       network.migration_year >= filters.yearRange[0] &&
  //       network.migration_year <= filters.yearRange[1]
  //     // 새로 추가된 유저 이름 필터
  //     const matchesUserNetwork =
  //       !filters.userNetworkFilter ||
  //       !user.name ||
  //       network.user_name === user.name
  //     // 엔티티 유형 필터 조건
  //     const matchesEntityType =
  //       filters.entityType.includes("all") ||
  //       filters.entityType.includes(network.type)
  //     // 모든 필터 조건을 종합적으로 확인
  //     return (
  //       isForcedIncluded || // 강제로 포함된 네트워크는 항상 포함
  //       (matchesNationality &&
  //         matchesEthnicity &&
  //         matchesYearRange &&
  //         matchesUserNetwork &&
  //         matchesEntityType)
  //     )
  //   })
  // }, [networks, filters, selectedEdgeId, user.name])
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
  //   new Set(workerFilteredNetworks.map((m) => m.nationality)),
  // )
  // const uniqueEthnicities = Array.from(
  //   new Set(workerFilteredNetworks.map((m) => m.ethnicity)),
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
  // centralityValues를 useMemo로 메모이제이션
  const centralityValues = useMemo(() => {
    return calculateCentrality(workerFilteredNetworks, centralityType)
  }, [workerFilteredNetworks, centralityType])
  const topNetworks = Object.entries(centralityValues)
    .filter(([id]) => workerFilteredNetworks.some((m) => m.id === Number(id))) // 필터링된 네트워크에 해당하는 ID만 포함
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, centrality]) => {
      const network = workerFilteredNetworks.find((m) => m.id === Number(id)) // 필터링된 네트워크에서 찾기
      return {
        id: Number(id),
        name: String(network ? network.title : "Unknown"),
        centrality,
      }
    })
  const getNodeSize = (centrality: number, centralityType: string) => {
    let baseSize = 9
    let scaleFactor = 1.5
    if (centralityType === "degree") {
      scaleFactor = 0.5
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
  // 등록자별 네트워크, 엣지, 마이그레이션 트레이스 수 및 총점 계산
  const registrantStats =
    networks?.reduce(
      (acc, entity) => {
        const userId = entity.user_id
        if (!acc[userId]) {
          acc[userId] = {
            userName: entity.user_name,
            networkCount: 0,
            edgeCount: 0,
            traceCount: 0,
            totalScore: 0,
          }
        }
        acc[userId].networkCount += 1
        acc[userId].edgeCount += entity.edges?.length || 0
        acc[userId].traceCount += entity.migration_traces?.length || 0
        acc[userId].totalScore =
          acc[userId].networkCount +
          acc[userId].edgeCount +
          acc[userId].traceCount
        return acc
      },
      {} as {
        [userId: number]: {
          userName: string
          networkCount: number
          edgeCount: number
          traceCount: number
          totalScore: number
        }
      },
    ) || {}

  // 상위 3명의 등록자 추출 및 정렬 (총점 기준)
  const topRegistrants = Object.entries(registrantStats)
    .sort(([, a], [, b]) => b.totalScore - a.totalScore)
    .slice(0, 5)
    .map(([registrantId, stats], index) => ({
      registrantId: Number(registrantId),
      userName: stats.userName,
      totalScore: stats.totalScore,
      networkCount: stats.networkCount,
      edgeCount: stats.edgeCount,
      traceCount: stats.traceCount,
      medal:
        index === 0
          ? "🥇"
          : index === 1
            ? "🥈"
            : index === 2
              ? "🥉"
              : index === 3
                ? "4️⃣"
                : "5️⃣", // 표시용 문자열
      display: `${stats.totalScore} ${t("Points")}`,
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
        type: "Person",
        nationality: "",
        ethnicity: "",
        migration_year: "",
        latitude: latLng.lat,
        longitude: latLng.lng,
        migration_traces: [],
        connections: [
          {
            targetType: "Person",
            targetId: 0,
            strength: 0,
            type: "",
            year: "",
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
  // 검색창 입력 핸들러
  // 검색어 입력 핸들러
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query) // 즉시 검색어 상태 업데이트
    updateDebouncedSearchQuery(query) // 디바운싱된 검색어 업데이트
  }
  // 검색 버튼 클릭 핸들러
  const handleSearchClick = (query: string) => {
    setSearchQuery(query) // 검색어 업데이트
    if (query.trim() !== "") {
      setTriggerSearch((prev) => !prev) // 검색 실행 여부 토글
    }
  }
  const handleTooltipOpen = async (id: number) => {
    fetchComments(id)
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/networks/photo/${id}`,
      )
      const imageUrl = response.data.photo
      setHighlightedNode({
        id,
        photo: imageUrl,
      })
      const entity = getEntityById(id)
      if (entity) {
        setPopupPosition({ x: entity.latitude, y: entity.longitude })
      }
    } catch (error) {
      console.error("Error fetching photo:", error)
      setHighlightedNode({
        id,
        photo: "",
      })
    }
  }
  const tracesRef = useRef<any[]>([])
  const edgesRef = useRef<any[]>([])
  useEffect(() => {
    const newTraces = getMigrationTraces()
    const newEdges = getEdges()
    // 트레이스와 엣지의 변경 여부를 확인
    const tracesChanged =
      JSON.stringify(tracesRef.current) !== JSON.stringify(newTraces)
    const edgesChanged =
      JSON.stringify(edgesRef.current) !== JSON.stringify(newEdges)
    if (tracesChanged || edgesChanged) {
      // 이전 값 업데이트
      tracesRef.current = newTraces
      edgesRef.current = newEdges
      if (workerFilteredNetworks && workerFilteredNetworks.length > 0) {
        const traces = newTraces.flat() // 새로운 트레이스 가져오기
        const analysis = analyzeNetworkType(
          workerFilteredNetworks,
          newEdges,
          traces,
        ) // 분석 수행
        setNetworkAnalysis(analysis) // 분석 결과 업데이트
      }
    }
  }, [workerFilteredNetworks, filters, yearRangeInput]) // yearRange -> yearRangeInput
  // const CustomMapComponent = () => {
  //   const map = useMap()
  //   const [edgeLayer, setEdgeLayer] = useState<L.LayerGroup | null>(null)
  //   const [clickedEdge, setClickedEdge] = useState<number | null>(null) // 클릭된 엣지 ID 상태 추가
  //   const edges = useMemo(() => getEdges(), [filters, networks])
  //   useEffect(() => {
  //     if (edgeLayer) {
  //       edgeLayer.clearLayers()
  //       edgeLayer.remove()
  //     }
  //     const newEdgeLayer = L.layerGroup().addTo(map)
  //     setEdgeLayer(newEdgeLayer)
  //     edges.forEach((edge, index) => {
  //       const positions = edge.slice(0, 2) as LatLngExpression[]
  //       const color = "#8B4513" // 선 색상 (SaddleBrown)
  //       const arrowColor = "#DAA520" // 화살표 색상 (GoldenRod)
  //       const opacity = (edge[3] as number) * 0.16 + 0.2
  //       const edgeType = edge[4] as string
  //       const connectionStrength = edge[3] as number
  //       const connectionYear = edge[5] as number
  //       const leafletPolyline = L.polyline(positions, {
  //         color: color,
  //         weight: 2,
  //         opacity: opacity,
  //       }).addTo(newEdgeLayer)
  //       const decorator = L.polylineDecorator(leafletPolyline, {
  //         patterns: [
  //           {
  //             offset: "50%", // 화살표 위치
  //             repeat: 0, // 반복 없음
  //             symbol: L.Symbol.arrowHead({
  //               pixelSize: 10, // 화살표 크기
  //               polygon: true,
  //               pathOptions: { color: arrowColor, fillOpacity: 1, weight: 0 },
  //             }),
  //           },
  //         ],
  //       }).addTo(newEdgeLayer)
  //       // 툴팁 내용 설정
  //       const tooltipContent =
  //         clickedEdge === index
  //           ? `<span>${t("connectionType")}: ${t(edgeType)}<br/>${t("connectionStrength")}: ${connectionStrength}<br/>${t("connectionYear")}: ${connectionYear}</span>`
  //           : `<span>${t(edgeType)} (${connectionStrength}, ${connectionYear})</span>`
  //       // 툴팁 바인딩
  //       leafletPolyline.bindTooltip(tooltipContent, {
  //         permanent: showEdgeDetails, // 토글 상태에 따라 항상 표시
  //         direction: "center",
  //         opacity: 0.7,
  //       })
  //       // 클릭 이벤트 핸들러 추가
  //       leafletPolyline.on("click", () => {
  //         setClickedEdge(index) // 클릭된 엣지 ID 설정
  //       })
  //     })
  //     return () => {
  //       if (newEdgeLayer) {
  //         newEdgeLayer.clearLayers()
  //         newEdgeLayer.remove()
  //       }
  //     }
  //   }, [map, edges, showEdgeDetails, clickedEdge]) // clickedEdge 상태를 의존성에 추가
  //   return null
  // }
  const HandleMapClick = () => {
    useMapEvents({
      click: (e) => {
        // 클릭된 대상이 범례가 아닌 경우에만 하이라이트 해제
        if (
          e.originalEvent.target instanceof HTMLElement &&
          e.originalEvent.target.closest(".legend-container")
        ) {
          return // 범례를 클릭한 경우 아무 작업도 하지 않음
        }
        setHighlightedNode(null) // 지도 빈 공간 클릭 시 하이라이트 해제
      },
    })
    return null
  }
  //  가장 가까운 트레이스 찾기 함수
  const findClosestTrace = (network, traces) => {
    if (!traces.length) return null
    let minDist = Infinity
    let closest = null
    traces.forEach((trace) => {
      const dist = Math.sqrt(
        Math.pow(network.latitude - trace.latitude, 2) +
          Math.pow(network.longitude - trace.longitude, 2),
      )
      if (dist < minDist) {
        minDist = dist
        closest = trace
      }
    })
    return closest
  }

  // 네트워크 id와 연도 기준으로 가장 가까운 마이그레이션 트레이스 찾기
  const findClosestTraceByYear = (
    networkId: number,
    year: string,
    allTraces: any[],
  ) => {
    const yearDate = new Date(year)
    // 해당 네트워크의 모든 트레이스 중 migration_year가 year 이하인 것만 필터
    const traces = allTraces
      .filter(
        (t) =>
          t.network_id === networkId &&
          typeof t.migration_year === "string" &&
          t.migration_year.length > 0,
      )
      .sort(
        (a, b) =>
          new Date(a.migration_year).getTime() -
          new Date(b.migration_year).getTime(),
      )
    // year 이하 중 가장 최근(가장 큰 날짜) 찾기
    let closest = null
    for (let i = traces.length - 1; i >= 0; i--) {
      const traceDate = new Date(traces[i].migration_year)
      if (traceDate.getTime() <= yearDate.getTime()) {
        closest = traces[i]
        break
      }
    }
    // 만약 year 이하가 없으면 가장 이른 트레이스 반환
    if (!closest && traces.length > 0) {
      closest = traces[0]
    }
    return closest
  }
  const getMigrationTraces = () => {
    const tracesByNetwork: { [key: number]: any[] } = {}
    networks?.forEach((network) => {
      if (!tracesByNetwork[network.id]) {
        tracesByNetwork[network.id] = []
      }
      // 특정 네트워크가 선택된 경우, 해당 네트워크의 마이그레이션 트레이스만 추가
      if (
        !filters.selectedMigrationNetworkIds.length || // 선택 없으면 전체
        filters.selectedMigrationNetworkIds.includes(network.id)
      ) {
        network.migration_traces.forEach((trace) => {
          if (!tracesByNetwork[network.id]) {
            tracesByNetwork[network.id] = []
          }
          // 연도 및 필터 조건 적용
          if (
            trace.migration_year >= filters.migrationYearRange[0] &&
            trace.migration_year <= filters.migrationYearRange[1] &&
            (filters.migrationReasons.includes("all") ||
              filters.migrationReasons.includes(trace.reason)) &&
            (filters.entityType.includes("all") ||
              filters.entityType.includes(network.type)) && // 개체 필터 추가
            (filters.nationality.includes("all") ||
              filters.nationality.includes(network.nationality)) && // 국적 필터 추가
            (filters.ethnicity.includes("all") ||
              filters.ethnicity.includes(network.ethnicity)) // 민족 필터 추가
          ) {
            tracesByNetwork[network.id].push(trace)
          }
        })
      }
    })
    // 네트워크별로 정렬 및 번호 부여
    return Object.values(tracesByNetwork)
      .map((traces) =>
        traces
          .sort((a, b) => {
            // migration_year가 없으면 항상 뒤로
            if (!a.migration_year) return 1
            if (!b.migration_year) return -1
            return a.migration_year.localeCompare(b.migration_year)
          })
          .map((trace, index) => ({
            ...trace,
            traceNumber: index + 1, // 네트워크별로 번호 부여
          })),
      )
      .filter((traces) => {
        // 기존 필터 조건 적용
        const matchesYearRange = traces.some(
          (trace) =>
            trace.migration_year &&
            trace.migration_year >= filters.migrationYearRange[0] &&
            trace.migration_year <= filters.migrationYearRange[1],
        )
        const matchesUserNetworkTrace =
          !filters.userNetworkTraceFilter ||
          !user.name ||
          (networks &&
            traces &&
            traces[0] &&
            networks.some(
              (network) =>
                network.id === traces[0].network_id &&
                network.user_name === user.name,
            ))
        const matchesMigrationReasons =
          filters.migrationReasons.includes("all") ||
          filters.migrationReasons.length === 0 ||
          traces.some(
            (trace) =>
              trace.reason && filters.migrationReasons.includes(trace.reason),
          )
        return (
          matchesYearRange && matchesUserNetworkTrace && matchesMigrationReasons
        )
      })
  }

  // migrationTraces를 useMemo로 메모이제이션
  const migrationTraces = useMemo(
    () => getMigrationTraces(),
    [
      networks,
      filters,
      migrationYearRangeInput,
      selectedMigrationNetworkIds,
      user.name,
    ],
  )

  useEffect(() => {
    if (data && data.length > 0) {
      setNetworks(data)
      // networks 세팅 후에만 Korean 세팅
      setTimeout(() => {
        setFilters((prev) => ({
          ...prev,
          ethnicity: ["Korean"],
        }))
      }, 0)
    }
  }, [data])

  if (progress < 100) {
    return <Spinner progress={progress} />
  }

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
                value={
                  Array.isArray(filters.entityType)
                    ? entityOptions.filter(
                        (opt) =>
                          filters.entityType.includes(opt.value) &&
                          opt.value !== "all",
                      )
                    : []
                }
                placeholder={t("allEntityTypes")}
                isClearable
                isMulti
                styles={customStyles}
                menuPortalTarget={document.body}
                menuPlacement="auto"
                menuPosition="fixed"
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
                value={
                  Array.isArray(filters.nationality)
                    ? nationalityOptions.filter(
                        (opt) =>
                          filters.nationality.includes(opt.value) &&
                          opt.value !== "all",
                      )
                    : []
                }
                placeholder={t("allNationalities")}
                isClearable
                isMulti
                styles={customStyles}
                menuPortalTarget={document.body}
                menuPlacement="auto"
                menuPosition="fixed"
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
                value={
                  Array.isArray(filters.ethnicity)
                    ? filters.ethnicity
                        .filter(
                          (value) =>
                            value !== "all" &&
                            ethnicityOptions.some((opt) => opt.value === value),
                        )
                        .map((value) => ({
                          value,
                          label: value,
                        }))
                    : []
                }
                placeholder={t("allEthnicities")}
                isClearable
                isMulti
                styles={customStyles}
                menuPortalTarget={document.body}
                menuPlacement="auto"
                menuPosition="fixed"
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {/* 관계 연도 */}
            <div>
              <div className="p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]">
                <label className="text-sm">{t("yearRange")}</label>
                <input
                  type="date"
                  value={yearRangeInput[0]}
                  onChange={(e) =>
                    setYearRangeInput([e.target.value, yearRangeInput[1]])
                  }
                  className="border rounded px-2 py-1"
                  min="0000-01-01"
                  max="3000-12-31"
                />
                <span>~</span>
                <input
                  type="date"
                  value={yearRangeInput[1]}
                  onChange={(e) =>
                    setYearRangeInput([yearRangeInput[0], e.target.value])
                  }
                  className="border rounded px-2 py-1"
                  min="0000-01-01"
                  max="3000-12-31"
                />
              </div>
            </div>
            {/* 관계 유형 */}
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
                menuPortalTarget={document.body}
                menuPlacement="auto"
                menuPosition="fixed"
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {/* 중심성 */}
            <div>
              <Select
                options={[
                  { value: "none", label: t("selectCentrality") },
                  { value: "degree", label: t("degreeCentrality") },
                  // { value: "betweenness", label: t("betweenessCentrality") },
                  // { value: "closeness", label: t("closenessCentrality") },
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
                menuPortalTarget={document.body}
                menuPlacement="auto"
                menuPosition="fixed"
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {/* 이동 연도 */}
            <div>
              <div className="p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]">
                <label className="text-sm">{t("migrationTraceability")}</label>
                <input
                  type="date"
                  value={migrationYearRangeInput[0]}
                  onChange={(e) =>
                    setMigrationYearRangeInput([
                      e.target.value,
                      migrationYearRangeInput[1],
                    ])
                  }
                  className="border rounded px-2 py-1"
                  min="0000-01-01"
                  max="3000-12-31"
                />
                <span>~</span>
                <input
                  type="date"
                  value={migrationYearRangeInput[1]}
                  onChange={(e) =>
                    setMigrationYearRangeInput([
                      migrationYearRangeInput[0],
                      e.target.value,
                    ])
                  }
                  className="border rounded px-2 py-1"
                  min="0000-01-01"
                  max="3000-12-31"
                />
              </div>
            </div>
            {/* 이동 원인 */}
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
                menuPortalTarget={document.body}
                menuPlacement="auto"
                menuPosition="fixed"
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {/* 나의 노드 */}
            {user.isLoggedIn && (
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
            )}
            {/* 나의 관계망 */}
            {user.isLoggedIn && (
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
            )}
            {/* 나의 이동 */}
            {user.isLoggedIn && (
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
            )}
            {/* 검색창 */}
            <div>
              <div className="p-1 border rounded bg-[#d1c6b1] flex items-center border-2 border-[#9e9d89]">
                {/* <input
                  type="text"
                  placeholder={t("Search Networks")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchClick()
                    } else if (e.key === "Escape") {
                      setSearchQuery("") // ESC 키를 누르면 검색창 초기화
                    }
                  }}
                  className="w-full p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />{" "} */}
                <SearchBar onSearch={handleSearchClick} />
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
                  value={
                    Array.isArray(filters.entityType)
                      ? entityOptions.filter(
                          (opt) =>
                            filters.entityType.includes(opt.value) &&
                            opt.value !== "all",
                        )
                      : []
                  }
                  placeholder={t("allEntityTypes")}
                  isClearable
                  isMulti
                  styles={{
                    ...customStyles,
                    multiValue: (provided) => ({
                      ...provided,
                      display: "inline-flex", // 선택된 항목을 가로로 정렬
                      alignItems: "center",
                      margin: "0 4px", // 항목 간격 조정
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      whiteSpace: "normal", // 텍스트 줄바꿈 허용
                      overflow: "visible", // 텍스트가 생략되지 않도록 설정
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      cursor: "pointer",
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 드롭다운이 다른 요소 위에 표시되도록 설정
                  }}
                  menuPortalTarget={document.body} // 드롭다운을 body에 렌더링
                  menuPlacement="auto" // 드롭다운이 위/아래로 자동 배치되도록 설정
                  menuPosition="fixed" // 드롭다운 위치를 고정하여 스크롤 영향을 받지 않도록 설정
                  className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  value={
                    Array.isArray(filters.nationality)
                      ? nationalityOptions.filter(
                          (opt) =>
                            filters.nationality.includes(opt.value) &&
                            opt.value !== "all",
                        )
                      : []
                  }
                  placeholder={t("allNationalities")}
                  isClearable
                  isMulti
                  styles={{
                    ...customStyles,
                    multiValue: (provided) => ({
                      ...provided,
                      display: "inline-flex", // 선택된 항목을 가로로 정렬
                      alignItems: "center",
                      margin: "0 4px", // 항목 간격 조정
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      whiteSpace: "normal", // 텍스트 줄바꿈 허용
                      overflow: "visible", // 텍스트가 생략되지 않도록 설정
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      cursor: "pointer",
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 드롭다운이 다른 요소 위에 표시되도록 설정
                  }}
                  menuPortalTarget={document.body} // 드롭다운을 body에 렌더링
                  menuPlacement="auto" // 드롭다운이 위/아래로 자동 배치되도록 설정
                  menuPosition="fixed" // 드롭다운 위치를 고정하여 스크롤 영향을 받지 않도록 설정
                  className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  value={
                    Array.isArray(filters.ethnicity)
                      ? filters.ethnicity
                          .filter(
                            (value) =>
                              value !== "all" &&
                              ethnicityOptions.some(
                                (opt) => opt.value === value,
                              ),
                          )
                          .map((value) => ({
                            value,
                            label: value,
                          }))
                      : []
                  }
                  placeholder={t("allEthnicities")}
                  isClearable
                  isMulti
                  styles={{
                    ...customStyles,
                    multiValue: (provided) => ({
                      ...provided,
                      display: "inline-flex", // 선택된 항목을 가로로 정렬
                      alignItems: "center",
                      margin: "0 4px", // 항목 간격 조정
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      whiteSpace: "normal", // 텍스트 줄바꿈 허용
                      overflow: "visible", // 텍스트가 생략되지 않도록 설정
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      cursor: "pointer",
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 드롭다운이 다른 요소 위에 표시되도록 설정
                  }}
                  menuPortalTarget={document.body} // 드롭다운을 body에 렌더링
                  menuPlacement="auto" // 드롭다운이 위/아래로 자동 배치되도록 설정
                  menuPosition="fixed" // 드롭다운 위치를 고정하여 스크롤 영향을 받지 않도록 설정
                  className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </FilterContainer>
            </div>
            {/* Year Range */}
            <div className="p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]">
              <label className="text-sm">{t("yearRange")}</label>
              <input
                type="date"
                value={yearRangeInput[0]}
                onChange={(e) =>
                  setYearRangeInput([e.target.value, yearRangeInput[1]])
                }
                className="border rounded px-2 py-1"
                min="0000-01-01"
                max="3000-12-31"
              />
              <span>~</span>
              <input
                type="date"
                value={yearRangeInput[1]}
                onChange={(e) =>
                  setYearRangeInput([yearRangeInput[0], e.target.value])
                }
                className="border rounded px-2 py-1"
                min="0000-01-01"
                max="3000-12-31"
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
                styles={{
                  ...customStyles,
                  multiValue: (provided) => ({
                    ...provided,
                    display: "inline-flex", // 선택된 항목을 가로로 정렬
                    alignItems: "center",
                    margin: "0 4px", // 항목 간격 조정
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    whiteSpace: "normal", // 텍스트 줄바꿈 허용
                    overflow: "visible", // 텍스트가 생략되지 않도록 설정
                  }),
                  multiValueRemove: (provided) => ({
                    ...provided,
                    cursor: "pointer",
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 드롭다운이 다른 요소 위에 표시되도록 설정
                }}
                menuPortalTarget={document.body} // 드롭다운을 body에 렌더링
                menuPlacement="auto" // 드롭다운이 위/아래로 자동 배치되도록 설정
                menuPosition="fixed" // 드롭다운 위치를 고정하여 스크롤 영향을 받지 않도록 설정
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {/* Centrality */}
              {user.isLoggedIn ? (
                <Select
                  options={[
                    { value: "none", label: t("selectCentrality") },
                    { value: "degree", label: t("degreeCentrality") },
                    // {
                    //   value: "betweenness",
                    //   label: t("betweenessCentrality"),
                    // },
                    // { value: "closeness", label: t("closenessCentrality") },
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
                  styles={{
                    ...customStyles,
                    multiValue: (provided) => ({
                      ...provided,
                      display: "inline-flex", // 선택된 항목을 가로로 정렬
                      alignItems: "center",
                      margin: "0 4px", // 항목 간격 조정
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      whiteSpace: "normal", // 텍스트 줄바꿈 허용
                      overflow: "visible", // 텍스트가 생략되지 않도록 설정
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      cursor: "pointer",
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 드롭다운이 다른 요소 위에 표시되도록 설정
                  }}
                  menuPortalTarget={document.body} // 드롭다운을 body에 렌더링
                  menuPlacement="auto" // 드롭다운이 위/아래로 자동 배치되도록 설정
                  menuPosition="fixed" // 드롭다운 위치를 고정하여 스크롤 영향을 받지 않도록 설정
                  className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <></>
              )}
            </div>
            {/* Migration Traceability */}
            <div className="p-1 border rounded bg-[#d1c6b1] flex gap-2 items-center border-2 border-[#9e9d89]">
              <label className="text-sm">{t("migrationTraceability")}</label>
              <input
                type="date"
                value={migrationYearRangeInput[0]}
                onChange={(e) =>
                  setMigrationYearRangeInput([
                    e.target.value,
                    migrationYearRangeInput[1],
                  ])
                }
                className="border rounded px-2 py-1"
                min="0000-01-01"
                max="3000-12-31"
              />
              <span>~</span>
              <input
                type="date"
                value={migrationYearRangeInput[1]}
                onChange={(e) =>
                  setMigrationYearRangeInput([
                    migrationYearRangeInput[0],
                    e.target.value,
                  ])
                }
                className="border rounded px-2 py-1"
                min="0000-01-01"
                max="3000-12-31"
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
                styles={{
                  ...customStyles,
                  multiValue: (provided) => ({
                    ...provided,
                    display: "inline-flex", // 선택된 항목을 가로로 정렬
                    alignItems: "center",
                    margin: "0 4px", // 항목 간격 조정
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    whiteSpace: "normal", // 텍스트 줄바꿈 허용
                    overflow: "visible", // 텍스트가 생략되지 않도록 설정
                  }),
                  multiValueRemove: (provided) => ({
                    ...provided,
                    cursor: "pointer",
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 드롭다운이 다른 요소 위에 표시되도록 설정
                }}
                menuPortalTarget={document.body} // 드롭다운을 body에 렌더링
                menuPlacement="auto" // 드롭다운이 위/아래로 자동 배치되도록 설정
                menuPosition="fixed" // 드롭다운 위치를 고정하여 스크롤 영향을 받지 않도록 설정
                className="p-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {/* Search */}
            <div className="p-1 border rounded bg-[#d1c6b1] flex gap-0.5 items-center border-2 border-[#9e9d89]">
              {user.isLoggedIn ? (
                <>
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
                </>
              ) : (
                <></>
              )}
              {/* <input
                type="text"
                placeholder={t("Search Networks")}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchClick()
                  } else if (e.key === "Escape") {
                    setSearchQuery("") // ESC 키를 누르면 검색창 초기화
                  }
                }}
                className="w-36 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              /> */}
              <SearchBar onSearch={handleSearchClick} />
            </div>
          </SwipeableContainer>
        )}
        {/* Render Search Results */}
        {triggerSearch && searchQuery && (
          <div
            className={`flex justify-end absolute w-full z-10 ${
              triggerSearch ? "block" : "hidden"
            }`} // 검색 결과가 숨겨지면 완전히 제거
            style={{
              top: "4rem",
              right: "0",
              opacity: triggerSearch ? 0.8 : 0, // 투명도 조정
              pointerEvents: "none",
            }}
          >
            <div
              className="bg-white shadow rounded p-4 border border-gray-300 max-h-80 overflow-y-auto"
              style={{
                maxWidth: window.innerWidth <= 768 ? "90%" : "30%", // 모바일에서는 90%, 데스크톱에서는 30%
                marginRight: "1rem", // 오른쪽 끝에서 약간의 여백
                position: "relative",
                backgroundColor: "rgba(255, 255, 255, 0.8)", // 배경 투명도
                pointerEvents: "auto",
              }}
            >
              <SearchResults
                searchQuery={searchQuery}
                setFocusedNode={setFocusedNode}
                handleEntityClick={handleEntityClick}
                handleMigrationTraceClick={handleMigrationTraceClick}
                handleEdgeClick={handleEdgeClick}
                handleNetworkEdgesToggle={handleNetworkEdgesToggle}
              />
            </div>
          </div>
        )}
      </div>
      {/* 관계/이동 토글 버튼은 Legend로 이동 */}
      {/* 3D 모드와 2D 모드 전환 */}
      {is3DMode ? (
        <ThreeDMap
          networks={networks}
          filters={filters}
          filteredNetworks={workerFilteredNetworks}
          filteredTraces={filteredTraces}
          filteredEdges={getEdgesFor3D()}
          handleEdgeClick={handleEdgeClick}
          handleNetworkEdgesToggle={handleNetworkEdgesToggle}
        />
      ) : (
        <MapContainer
          center={[40, 130]} // 스페인과 아메리카 대륙 중간 대서양 좌표
          zoom={5}
          zoomControl={false} // 확대/축소 컨트롤 제거
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
          maxBoundsViscosity={1.2} // 최대 경계 범위 조정
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
            <FocusMap
              lat={focusedNode.lat}
              lng={focusedNode.lng}
              zoom={mapZoom}
            />
          )}
          {/* 기여자 랭킹 토글 버튼 */}
          <button
            onClick={toggleTopContributorsVisibility}
            style={{
              position: "absolute",
              top: "0rem",
              left: "0rem",
              zIndex: 2000,
              backgroundColor: "#3e2723",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            {isTopContributorsVisible ? "-" : "+"}
          </button>
          {/* 범례 토글 버튼 */}
          <button
            onClick={toggleLegendVisibility}
            style={{
              position: "absolute",
              top: "0rem",
              right: "0rem", // 화면 오른쪽 끝에 고정
              zIndex: 2000,
              backgroundColor: "#3e2723",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            {isLegendVisible ? "-" : "+"}
          </button>
          {/* 기여자 랭킹 */}
          {isTopContributorsVisible && (
            <LegendBox>
              <h2>{t("topRegistrants")}</h2>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#4b1e22", // 더 어두운 버건디
                  marginBottom: "0.2rem",
                  fontWeight: "bold", // 폰트 굵게
                  textAlign: "center", // 중앙 정렬
                }}
              >
                {t("Score")}({t("Node")}+{t("Edge")}+{t("Mobility")})
              </div>
              <ul>
                {topRegistrants.map((r) => (
                  <div key={r.registrantId}>
                    {r.medal} {r.userName} : {r.display}
                  </div>
                ))}
              </ul>
            </LegendBox>
          )}
          {/* 범례 */}
          {isLegendVisible && (
            <Legend
              topNetworks={topNetworks}
              onEntityClick={handleEntityClick}
              centralityType={centralityType}
              networkAnalysis={networkAnalysis}
              showRelationsOnly={showRelationsOnly}
              showMigrationsOnly={showMigrationsOnly}
              onToggleRelationsOnly={() => {
                setShowRelationsOnly((prev) => !prev)
              }}
              onToggleMigrationsOnly={() => {
                setShowMigrationsOnly((prev) => !prev)
              }}
              showEdgeDetails={showEdgeDetails}
              showMigrationReasons={showMigrationReasons}
              onToggleEdgeDetails={toggleEdgeDetails}
              onToggleMigrationReasons={toggleMigrationReasons}
            />
          )}
          {/* 네트워크 이름 표시/비표시 토글 버튼
          // <button
          //   onClick={toggleNetworkNames}
          //   style={{
          //     position: "absolute",
          //     top: "2rem", // 범례 토글 버튼 바로 아래
          //     right: "0rem",
          //     zIndex: 2000,
          //     backgroundColor: "#3e2723",
          //     color: "#fff",
          //     border: "none",
          //     borderRadius: "8px",
          //     padding: "8px 12px",
          //     cursor: "pointer",
          //   }}
          // >
          //   {showNetworkNames ? "-" : "+"}
          // </button> */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* 지도에 표시될 네트워크 데이터 */}
          {/* {workerFilteredNetworks.map((network) => {
            const size = getNodeSize(
              centralityValues[network.id] || 0,
              centralityType,
            )
            const isHighlighted =
              highlightedNode && highlightedNode.id === network.id
            let color = network.type === "Organization" ? "blue" : "red"
            if (isHighlighted) {
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
                zIndexOffset={1000}
                eventHandlers={{
                  click: (e) => {
                    handleOpenPopup(network, {
                      x: e.latlng.lat,
                      y: e.latlng.lng,
                    })
                  },
                }}
              >
                {showNetworkNames && (
                  <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -size / 2]}
                    className="custom-tooltip"
                    opacity={0.7}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: isMobile ? "14px" : "16px",
                        fontWeight: "bold",
                        color: "#3E2723",
                      }}
                    >
                      {network.title}
                    </div>
                  </Tooltip>
                )}
              </Marker>
            )
          })} */}
          {openPopups.map((popup) => (
            <ResizablePopup
              key={popup.id}
              position={popup.position}
              onClose={() => handleClosePopup(popup.id)}
            >
              <PopupContent>
                <strong className="text-lg font-semibold block mb-2">
                  No.{popup.network.id} : {popup.network.title}
                </strong>

                <div className="text-gray-700 text-sm space-y-1">
                  {popup.photo && (
                    <div className="flex justify-center mb-2">
                      <img
                        src={popup.photo}
                        alt="Network"
                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  <PopupFilterButtonRow>
                    <PopupFilterButton
                      onClick={() => handleNetworkEdgesToggle(popup.network.id)}
                      active={selectedNetworkId === popup.network.id}
                      title={t("Show only this network's connections")}
                      style={{
                        background: "#fff3e0", // 주황색 계열
                        color: "#e65100",
                        border: "1.5px solid #ffe0b2",
                      }}
                    >
                      {selectedNetworkId === popup.network.id
                        ? ` ${t("Connections")}-${popup.network.title.length > 8 ? popup.network.title.slice(0, 8) + "…" : popup.network.title}`
                        : t("All Connections")}
                    </PopupFilterButton>
                    <PopupFilterButton
                      onClick={() =>
                        handleMigrationTraceClick(popup.network.id)
                      }
                      active={selectedMigrationNetworkIds.includes(
                        popup.network.id,
                      )}
                      title={t("Show only this network's migrations")}
                      style={{
                        background: "#e3f2fd", // 파란색 계열
                        color: "#1976d2",
                        border: "1.5px solid #bbdefb",
                      }}
                    >
                      {selectedMigrationNetworkIds.includes(popup.network.id)
                        ? `${t("Mobility")}-${popup.network.title.length > 8 ? popup.network.title.slice(0, 8) + "…" : popup.network.title} `
                        : t("All Mobility")}
                    </PopupFilterButton>
                  </PopupFilterButtonRow>
                  <p>
                    <span className="font-medium">{t("Creator Name")}:</span>{" "}
                    {popup.network.user_name}
                  </p>
                  <p>
                    <span className="font-medium">{t("Type")}:</span>{" "}
                    {popup.network.type}
                  </p>
                  <p>
                    {t("Centrality")}: {centralityValues[popup.network.id] || 0}
                  </p>
                  <p>
                    <span className="font-medium">{t("Nationality")}</span>{" "}
                    {popup.network.nationality}
                  </p>
                  <p>
                    <span className="font-medium">{t("Ethnicity")}:</span>{" "}
                    {popup.network.ethnicity}
                  </p>
                  <p>
                    <span className="font-medium">
                      {popup.network.type === "Person"
                        ? t("Birth Year")
                        : t("Established Year")}
                    </span>
                    <span className="font-medium">
                      : {popup.network.migration_year}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">
                      {popup.network.type === "Person"
                        ? t("Death Year")
                        : t("Dissolved Year")}
                    </span>
                    <span className="font-medium">
                      : {popup.network.end_year}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">{t("Latitude")}:</span>{" "}
                    {popup.network.latitude.toFixed(5)}
                  </p>
                  <p>
                    <span className="font-medium">{t("Longitude")}:</span>{" "}
                    {popup.network.longitude.toFixed(5)}
                  </p>
                </div>
                {/* === 마이그레이션 트레이스 테이블 추가 === */}
                <div style={{ margin: "1rem 0" }}>
                  <button
                    onClick={() => setShowMigrationTable((v) => !v)}
                    style={{
                      background: "#e3f2fd",
                      color: "#1976d2",
                      border: "none",
                      borderRadius: "6px",
                      padding: "0.5em 1.2em",
                      fontWeight: 600,
                      fontSize: "1.05em",
                      cursor: "pointer",
                      marginBottom: "0.3em",
                      boxShadow: "0 1px 3px rgba(33,150,243,0.07)",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {showMigrationTable ? t("Mobility") : t("Mobility")}
                  </button>
                  <CollapsibleSection open={showMigrationTable}>
                    <MigrationStyledTable>
                      <thead>
                        <tr>
                          <th>{t("No.")}</th>
                          <th>{t("Year")}</th>
                          <th>{t("Place")}</th>
                          <th>{t("Reason")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {popup.network.migration_traces
                          .sort((a, b) => {
                            if (!a.migration_year) return 1
                            if (!b.migration_year) return -1
                            return a.migration_year.localeCompare(
                              b.migration_year,
                            )
                          })
                          .map((trace, idx) => (
                            <tr key={trace.id}>
                              <td>{idx + 1}</td>
                              <td>{trace.migration_year}</td>
                              <td>{trace.location_name}</td>
                              <td>{trace.reason}</td>
                            </tr>
                          ))}
                      </tbody>
                    </MigrationStyledTable>
                  </CollapsibleSection>
                </div>
                <div style={{ margin: "1rem 0" }}>
                  <button
                    onClick={() => setShowEdgeTable((v) => !v)}
                    style={{
                      background: "#fff3e0",
                      color: "#e65100",
                      border: "none",
                      borderRadius: "6px",
                      padding: "0.5em 1.2em",
                      fontWeight: 600,
                      fontSize: "1.05em",
                      cursor: "pointer",
                      marginBottom: "0.3em",
                      boxShadow: "0 1px 3px rgba(255,152,0,0.07)",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {showEdgeTable ? t("Connections") : t("Connections")}
                  </button>
                  <CollapsibleSection open={showEdgeTable}>
                    <EdgeStyledTable>
                      <thead>
                        <tr>
                          <th>{t("Type")}</th>
                          <th>{t("Target")}</th>
                          <th>{t("Year")}</th>
                          <th>{t("Strength")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {popup.network.edges?.map((edge, idx) => {
                          const target = networks?.find(
                            (n) => n.id === edge.targetId,
                          )
                          return (
                            <tr key={idx}>
                              <td>{edge.edgeType}</td>
                              <td>{target ? target.title : edge.targetId}</td>
                              <td>{edge.year}</td>
                              <td>{edge.strength}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </EdgeStyledTable>
                  </CollapsibleSection>
                </div>
                <div
                  className="mt-2 mb-2 border rounded text-xs"
                  style={{
                    backgroundColor: "rgba(33, 150, 243, 0.18)",
                    borderColor: "#90caf9",
                  }}
                >
                  <b>💡 {t("Smilarity Insight")}</b>
                  <SimilarityInsightList>
                    {recommendConnections(
                      popup.network,
                      workerFilteredNetworks,
                      3,
                    ).map((rec) => (
                      <SimilarityInsightItem
                        key={rec.id}
                        title={rec.title}
                        onClick={() => {
                          handleTooltipOpen(rec.id)
                          handleNetworkEdgesToggle(rec.id)
                          handleMigrationTraceClick(rec.id)
                          const entity = getEntityById(rec.id)
                          if (entity && guideStep !== 3) {
                            focusNode(entity)
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="item-title">{rec.title}</span>
                        <span className="item-meta">
                          ({rec.type}, {rec.nationality}, {rec.ethnicity})
                        </span>
                      </SimilarityInsightItem>
                    ))}
                  </SimilarityInsightList>
                </div>
                <AIStorytelling
                  originId={popup.network.id}
                  originTitle={popup.network.title}
                  migrationPath={popup.network.migration_traces.map(
                    (trace) => ({
                      year: String(trace.migration_year),
                      place: trace.location_name,
                      reason: trace.reason,
                    }),
                  )}
                  networkSummary={`
이 네트워크의 주요 인물과 단체, 그리고 이들 사이의 관계는 다음과 같습니다:
${/* 네트워크 요약 텍스트 동적으로 생성 */ ""}
이 네트워크의 관계망 스토리를 3문장으로 요약해줘.
`}
                  edges={
                    popup.network.edges?.map((edge) => {
                      const target = networks?.find(
                        (n) => n.id === edge.targetId,
                      )
                      return {
                        targetId: edge.targetId,
                        targetTitle: target ? target.title : "",
                        year: String(edge.year),
                        edgeType: edge.edgeType,
                      }
                    }) ?? []
                  }
                />
              </PopupContent>
              <div
                className="max-h-32 max-w-full overflow-y-auto border-t pt-2"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  marginTop: "16px",
                }}
              >
                <CommentSection networkId={popup.network.id} />
              </div>
            </ResizablePopup>
          ))}
          <HandleMapClickForPopupSize />
          {/* <CustomMapComponent /> MapContainer 내부에 위치시킴 */}
          {migrationTraces.map((traces) =>
            traces.map((trace) => {
              const network = networks?.find((n) => n.id === trace.network_id)
              const networkName = network ? network.title : "Unknown"
              const baseSize = 14
              const sizeIncrement = 1.3
              const size = baseSize + trace.traceNumber * sizeIncrement
              const isDuplicate = traces.some(
                (t) =>
                  t.id !== trace.id &&
                  t.latitude === trace.latitude &&
                  t.longitude === trace.longitude,
              )
              if (isDuplicate) {
                return null
              }
              return (
                <Marker
                  key={trace.id}
                  position={[trace.latitude, trace.longitude]}
                  icon={L.divIcon({
                    className: "custom-trace-marker",
                    html: `<div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${size}px;
            height: ${size}px;
            background-color: #FF5722;
            color: white;
            border-radius: 50%;
            font-size: ${size / 1.2}px;
            font-weight: bold;
            border: 2px solid #BF360C;">
            ${trace.traceNumber}
          </div>`,
                  })}
                  eventHandlers={{
                    click: () => {
                      const network = networks?.find(
                        (n) => n.id === trace.network_id,
                      )
                      if (network) {
                        handleOpenPopup(network, {
                          x: trace.latitude,
                          y: trace.longitude,
                        })
                      }
                    },
                  }}
                >
                  {showMigrationReasons && (
                    <Tooltip
                      permanent
                      direction="top"
                      offset={[0, -12]}
                      className="custom-tooltip"
                      opacity={0.7}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          fontSize: isMobile ? "14px" : "16px",
                          fontWeight: "bold",
                          color: "#3E2723",
                        }}
                      >
                        {trace.reason} ({trace.migration_year})
                      </div>
                    </Tooltip>
                  )}
                </Marker>
              )
            }),
          )}
          {/* 관계/이동 토글에 따라 명확하게 분기 */}
          {/* 둘 다 OFF: 아무것도 안보임 */}
          {!showRelationsOnly && !showMigrationsOnly && null}
          {/* 둘 다 ON: 둘 다 보임 */}
          {showRelationsOnly && showMigrationsOnly && (
            <>
              {/* 이동선 */}
              {migrationTraces.map((traces) =>
                traces.slice(0, -1).map((trace, index) => {
                  const nextTrace = traces[index + 1]
                  if (trace.network_id !== nextTrace.network_id) return null
                  return (
                    <Polyline
                      key={`${trace.id}-${nextTrace.id}`}
                      positions={[
                        [trace.latitude, trace.longitude],
                        [nextTrace.latitude, nextTrace.longitude],
                      ]}
                      color="#1976d2"
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
                          <strong>{t("Network ID")}:</strong> ${nextTrace.network_id}<br/>
                          <strong>{t("Migration Year")}:</strong> ${nextTrace.migration_year}<br/>
                          <strong>{t("Location")}:</strong> ${nextTrace.location_name}<br/>
                          <strong>{t("Reason")}:</strong> ${nextTrace.reason}
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
                  return (
                    <MigrationTraceDecorator traces={migrationTraces.flat()} />
                  )
                }),
              )}
              {/* 관계선 */}
              {getEdges()
                .filter((edge) => {
                  const info = edge[6]
                  return (
                    !selectedNetworkId || info.sourceId === selectedNetworkId
                  )
                })
                .map((edge, idx) => {
                  const info = edge[6]
                  const allTraces = migrationTraces.flat()
                  const sourceTrace = findClosestTraceByYear(
                    info.sourceId,
                    info.edgeYear,
                    allTraces,
                  )
                  const targetTrace = findClosestTraceByYear(
                    info.targetId,
                    info.edgeYear,
                    allTraces,
                  )
                  if (!sourceTrace || !targetTrace) return null
                  const positions: [number, number][] = [
                    [
                      Number(sourceTrace.latitude),
                      Number(sourceTrace.longitude),
                    ],
                    [
                      Number(targetTrace.latitude),
                      Number(targetTrace.longitude),
                    ],
                  ]
                  const edgeWeight = Math.max(1, Math.min(5, edge[3] * 2))
                  return (
                    <>
                      <Polyline
                        key={`edge-trace-${info.sourceId}-${info.targetId}-${info.edgeYear}-${idx}`}
                        positions={positions}
                        color="#e65100"
                        weight={edgeWeight}
                        dashArray="5, 5"
                        eventHandlers={{
                          click: (e) => {
                            L.popup()
                              .setLatLng(e.latlng)
                              .setContent(
                                `<div>
                        <strong>${t("Connections")}</strong><br/>
                        ${t("Source")}: ${networks?.find((n) => n.id === info.sourceId)?.title || info.sourceId}<br/>
                        ${t("Target")}: ${networks?.find((n) => n.id === info.targetId)?.title || info.targetId}<br/>
                        ${t("Year")}: ${info.edgeYear}<br/>
                        ${t("Type")}: ${t(info.edgeType)}<br/>
                        ${t("Strength")}: ${edge[3]}
                      </div>`,
                              )
                              .openOn(e.target._map)
                          },
                        }}
                      >
                        {showEdgeDetails && (
                          <Tooltip permanent direction="center" opacity={0.7}>
                            <span>
                              {t(info.edgeType)} ({edge[3]}, {info.edgeYear})
                            </span>
                          </Tooltip>
                        )}
                      </Polyline>
                      <PolylineDecoratorWrapper
                        positions={positions}
                        patterns={[
                          {
                            offset: "50%",
                            repeat: 0,
                            symbol: L.Symbol.arrowHead({
                              pixelSize: 5 + edgeWeight,
                              polygon: true,
                              pathOptions: {
                                color: "#FF0000",
                                fillOpacity: 1,
                                weight: edgeWeight,
                              },
                            }),
                          },
                        ]}
                      />
                    </>
                  )
                })}
            </>
          )}
          {/* 이동(이주선)만 보기 */}
          {showMigrationsOnly && !showRelationsOnly && (
            <>
              {migrationTraces.map((traces) =>
                traces.slice(0, -1).map((trace, index) => {
                  const nextTrace = traces[index + 1]
                  if (trace.network_id !== nextTrace.network_id) return null
                  return (
                    <Polyline
                      key={`${trace.id}-${nextTrace.id}`}
                      positions={[
                        [trace.latitude, trace.longitude],
                        [nextTrace.latitude, nextTrace.longitude],
                      ]}
                      color="#1976d2"
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
                          <strong>{t("Network ID")}:</strong> ${nextTrace.network_id}<br/>
                          <strong>{t("Migration Year")}:</strong> ${nextTrace.migration_year}<br/>
                          <strong>{t("Location")}:</strong> ${nextTrace.location_name}<br/>
                          <strong>{t("Reason")}:</strong> ${nextTrace.reason}
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
                  return (
                    <MigrationTraceDecorator traces={migrationTraces.flat()} />
                  )
                }),
              )}
            </>
          )}
          {/* 관계(엣지)만 보기 */}
          {showRelationsOnly && !showMigrationsOnly && (
            <>
              {getEdges()
                .filter((edge) => {
                  const info = edge[6]
                  return (
                    !selectedNetworkId || info.sourceId === selectedNetworkId
                  )
                })
                .map((edge, idx) => {
                  const info = edge[6]
                  const allTraces = migrationTraces.flat()
                  const sourceTrace = findClosestTraceByYear(
                    info.sourceId,
                    info.edgeYear,
                    allTraces,
                  )
                  const targetTrace = findClosestTraceByYear(
                    info.targetId,
                    info.edgeYear,
                    allTraces,
                  )
                  if (!sourceTrace || !targetTrace) return null
                  const positions: [number, number][] = [
                    [
                      Number(sourceTrace.latitude),
                      Number(sourceTrace.longitude),
                    ],
                    [
                      Number(targetTrace.latitude),
                      Number(targetTrace.longitude),
                    ],
                  ]
                  const edgeWeight = Math.max(1, Math.min(5, edge[3] * 2))
                  return (
                    <>
                      <Polyline
                        key={`edge-trace-${info.sourceId}-${info.targetId}-${info.edgeYear}-${idx}`}
                        positions={positions}
                        color="#e65100"
                        weight={edgeWeight}
                        dashArray="5, 5"
                        eventHandlers={{
                          click: (e) => {
                            L.popup()
                              .setLatLng(e.latlng)
                              .setContent(
                                `<div>
                        <strong>${t("Connections")}</strong><br/>
                        ${t("Source")}: ${networks?.find((n) => n.id === info.sourceId)?.title || info.sourceId}<br/>
                        ${t("Target")}: ${networks?.find((n) => n.id === info.targetId)?.title || info.targetId}<br/>
                        ${t("Year")}: ${info.edgeYear}<br/>
                        ${t("Type")}: ${t(info.edgeType)}<br/>
                        ${t("Strength")}: ${edge[3]}
                      </div>`,
                              )
                              .openOn(e.target._map)
                          },
                        }}
                      >
                        {showEdgeDetails && (
                          <Tooltip permanent direction="center" opacity={0.7}>
                            <span>
                              {t(info.edgeType)} ({edge[3]}, {info.edgeYear})
                            </span>
                          </Tooltip>
                        )}
                      </Polyline>
                      <PolylineDecoratorWrapper
                        positions={positions}
                        patterns={[
                          {
                            offset: "50%",
                            repeat: 0,
                            symbol: L.Symbol.arrowHead({
                              pixelSize: 5 + edgeWeight,
                              polygon: true,
                              pathOptions: {
                                color: "#FF0000",
                                fillOpacity: 1,
                                weight: edgeWeight,
                              },
                            }),
                          },
                        ]}
                      />
                    </>
                  )
                })}
            </>
          )}
        </MapContainer>
      )}
    </div>
  )
}
const LegendBox = styled.div`
  position: absolute;
  top: 0.5rem; /* 맵 상단에 더 가깝게 */
  left: 1.4rem; /* 맵 왼쪽에 더 가깝게 */
  width: 10rem; /* 박스 너비를 더 작게 */
  background-color: rgba(255, 255, 255, 0.7);
  padding: 7px; /* 패딩을 줄임 */
  border: 1px solid #ccc;
  border-radius: 0.5rem; /* 둥근 모서리 크기 축소 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* 그림자 크기 축소 */
  z-index: 1000;
  font-size: 0.7rem; /* 기본 글자 크기 축소 */
  h2 {
    font-size: 0.9rem; /* 제목 글자 크기 축소 */
    margin-bottom: 0.2rem; /* 제목 아래 여백 축소 */
    text-align: center;
    font-weight: bold;
  }
  ul {
    font-size: 0.8rem; /* 리스트 글자 크기 축소 */
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    margin-bottom: 0.2rem; /* 리스트 항목 간격 축소 */
  }
  @media (max-width: 768px) {
    width: 8rem; /* 모바일에서 박스 너비 축소 */
    font-size: 0.6rem; /* 글자 크기 더 축소 */
    h2 {
      font-size: 0.8rem; /* 제목 글자 크기 더 축소 */
      font-weight: bold;
    }
    ul {
      font-size: 0.7rem; /* 리스트 글자 크기 더 축소 */
    }
  }
  @media (max-width: 480px) {
    width: 7rem; /* 더 작은 화면에서 박스 너비 축소 */
    font-size: 0.35rem; /* 글자 크기 더 축소 */
    h2 {
      font-size: 0.65rem; /* 제목 글자 크기 더 축소 */
    }
    ul {
      font-size: 0.6rem; /* 리스트 글자 크기 더 축소 */
    }
  }
`
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    display: "flex",
    flexWrap: "nowrap", // 줄바꿈 방지
    overflowX: "auto", // 가로 스크롤 활성화
    overflowY: "auto",
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
    maxWidth: "100%", // 최대 너비 설정
  }),
  multiValue: (provided) => ({
    ...provided,
    display: "inline-flex", // 선택된 항목을 가로로 정렬
    alignItems: "center",
    margin: "0 4px", // 항목 간격 조정
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    whiteSpace: "nowrap", // 텍스트 줄바꿈 방지
    overflow: "hidden", // 텍스트가 넘칠 경우 숨김
    textOverflow: "ellipsis", // 넘친 텍스트에 말줄임표 추가
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    cursor: "pointer",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }), // 드롭다운이 다른 요소 위에 표시되도록 설정
}
// 추가: 필터 버튼 컨테이너 스타일
const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 데스크톱에서는 6열 고정 */
  gap: 0.2rem; /* 버튼 간격을 줄임 */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* 모바일에서 2열로 변경 */
    gap: 0.1rem; /* 모바일에서 간격을 더 줄임 */
  }
`
// 3D 버튼 스타일 정의
const ThreeDButton = styled.button`
  display: none; /* 기본적으로 숨김 */
  @media (min-width: 768px) {
    display: inline-block; /* 데스크톱에서는 표시 */
  }
  padding: 0.3rem 0.8rem; /* 버튼 패딩을 줄임 */
  background-color: #3e2723;
  color: white;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-size: 0.8rem; /* 글자 크기를 줄임 */
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
  max-height: 5rem; /* 최대 높이 설정 */
  gap: 0.3rem; /* 버튼 간격을 줄임 */
  overflow-x: auto;
  overflow-y: auto;
  padding: 0.3rem; /* 상하 패딩을 줄임 */
  background-color: #d1c6b1;
  border-radius: 0.375rem;
  transition: transform 0.3s ease-in-out; /* 애니메이션 효과 */
  transform: ${({ isVisible }) =>
    isVisible ? "translateY(0)" : "translateY(-100%)"}; /* 위로 숨기기 */
  position: relative;
  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    height: 6px; /* 스크롤바 높이를 줄임 */
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
  .slick-dots {
    bottom: -20px; /* 도트 위치를 아래로 조정 */
  }
  .slick-dots li button:before {
    font-size: 10px; /* 도트 크기 조정 */
    color: #9e9d89; /* 도트 색상 */
  }
  .slick-dots li.slick-active button:before {
    color: #3e2723; /* 활성화된 도트 색상 */
  }
`
const PopupContent = styled.div`
  width: 110%; /* 팝업 너비 */
  max-height: 80%; /* 팝업 최대 높이 */
  font-size: 14px;
  background: rgba(241, 245, 249, 0.6); /* 약간의 투명도 추가 */
  padding: 2rem;
  overflow-y: auto;
  z-index: 2000;
  margin: -1rem -1rem;
  h2 {
    font-size: 16px;
    font-weight: bold;
    color: #3e2723; /* 제목 색상 */
    margin-bottom: 8px;
  }
  p {
    font-size: 0.8rem;
    color: #1f2937; /* 텍스트 색상 */
    margin-bottom: 0.2rem;
  }
  .popup-image {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 50%;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }
  }
  @media (max-width: 768px) {
    width: 100%;
    max-height: 350px;
    font-size: 12px;
  }
  @media (max-width: 480px) {
    width: 100%;
    max-height: 250px;
    font-size: 10px;
  }
`
const CommentSectionWrapper = styled.div`
  max-height: calc(100%); /* 팝업 내부에서 꽉 차도록 설정 */
  border-radius: 8px;
  width: 100%; /* 팝업 콘텐츠와 동일한 너비 */
  background: #f9fafb; /* 팝업과 동일한 배경색 */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  font-color: #111827 .comment-input {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.3s;
      &:focus {
        border-color: #3e2723;
        box-shadow: 0 0 0 2px rgba(62, 39, 35, 0.2);
      }
    }
    button {
      padding: 8px 16px;
      background-color: #3e2723;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s;
      &:hover {
        background-color: #5d4037;
      }
    }
  }
  .comment-list {
    max-height: calc(100%); /* 코멘트 리스트가 꽉 차도록 설정 */
    overflow-y: auto;
    li {
      background: #ffffff;
      border-radius: 4px;
      padding: 8px;
      box-shadow: 0px 2px 4px rgba(62, 39, 35, 0.2);
      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #5d4037;
        margin-bottom: 4px;
        .comment-user {
          font-weight: bold;
        }
        .comment-date {
          font-size: 11px;
          color: #9e9e9e;
        }
      }
      .comment-content {
        font-size: 12px;
        color: #3e2723;
      }
    }
  }
  @media (max-width: 768px) {
    max-height: calc(100% - 2rem);
    padding: 8px;
  }
  @media (max-width: 480px) {
    max-height: calc(100% - 1.5rem);
    font-size: 10px;
    padding: 5px;
  }
`

const SimilarityInsightList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0.2rem 0.2rem 0.2rem; // 상단, 좌우, 하단 패딩 추가
  margin: 0;
  list-style: none;
`
const SimilarityInsightItem = styled.li`
  flex: 1 1 30%;
  min-width: 180px;
  max-width: 320px;
  background: #fff8e1;
  border: 1px solid #ffe0b2;
  border-radius: 8px;
  padding: 0.5rem 0.7rem;
  margin-bottom: 0.2rem;
  display: flex;
  align-items: center;
  font-size: 0.98em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  .item-title {
    flex: 1;
    min-width: 0;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    color: #3e2723;
    padding-right: 0.3em;
  }
  .item-meta {
    margin-left: 0.5em;
    font-size: 0.85em;
    color: #8d6e63;
    flex-shrink: 0;
  }
`

const PopupFilterButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 0.7rem 0 0.5rem 0;
  justify-content: flex-end;
`

const PopupFilterButton = styled.button<{ active?: boolean }>`
  padding: 0.32rem 0.7rem;
  font-size: 0.92em;
  border-radius: 7px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  margin-right: 0.3rem;
  transition:
    background 0.2s,
    color 0.2s;
  background: ${({ active }) => (active ? "#e3f2fd" : "#fff3e0")};
  color: ${({ active }) => (active ? "#1976d2" : "#e65100")};
  box-shadow: 0 1px 3px
    ${({ active }) =>
      active ? "rgba(33,150,243,0.07)" : "rgba(255,152,0,0.07)"};
  &:hover {
    background: ${({ active }) => (active ? "#bbdefb" : "#ffe0b2")};
    color: ${({ active }) => (active ? "#1565c0" : "#ff9800")};
  }
`

// Add this styled component for the collapsible section
const CollapsibleSection = styled.div<{ open: boolean }>`
  max-height: ${({ open }) => (open ? "600px" : "0")};
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${({ open }) => (open ? 1 : 0)};
  transform: translateY(${({ open }) => (open ? "0" : "-10px")});
  transition-property: max-height, opacity, transform;
  margin-bottom: ${({ open }) => (open ? "1rem" : "0")};
`
// Table style for better readability
const MigrationStyledTable = styled.table`
  width: 100%;
  font-size: 1rem;
  margin-top: 0.7rem;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.93);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.07);
  th,
  td {
    padding: 0.7em 0.6em;
    border-bottom: 1px solid #e0e0e0;
    text-align: center;
  }
  th {
    background: #e3f2fd;
    color: #1976d2;
    font-size: 1.08em;
    font-weight: 600;
  }
  tr:last-child td {
    border-bottom: none;
  }
  td {
    color: #3e2723;
    font-size: 0.98em;
  }
`

// 관계(엣지) 테이블은 주황색 계열로 스타일링
const EdgeStyledTable = styled.table`
  width: 100%;
  font-size: 1rem;
  margin-top: 0.7rem;
  border-collapse: collapse;
  background: #fff8e1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.08);
  th,
  td {
    padding: 0.7em 0.6em;
    border-bottom: 1px solid #ffe0b2;
    text-align: center;
  }
  th {
    background: #ffe0b2;
    color: #e65100;
    font-size: 1.08em;
    font-weight: 600;
  }
  tr:last-child td {
    border-bottom: none;
  }
  td {
    color: #e65100;
    font-size: 0.98em;
  }
`
export default Map
