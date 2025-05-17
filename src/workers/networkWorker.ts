/* eslint-disable no-restricted-globals */

// 네트워크 필터링 및 중심성 계산 워커

export type Network = {
  id: number
  nationality: string
  ethnicity: string
  migration_year: number
  user_name: string
  type: string
  edges: { edgeType: string; targetId: number }[]
  migration_traces: { reason: string }[]
}

export type FilterOptions = {
  nationality: string[] | string
  ethnicity: string[] | string
  edgeType: string[] | string
  entityType: string
  yearRange: [number, number]
  migrationYearRange: [number, number] // 추가
  userNetworkFilter: boolean
  userNetworkTraceFilter: boolean
  userNetworkConnectionFilter: boolean
  migrationReasons: string[]
  selectedMigrationNetworkId: number | null
}

function filterNetworks(
  networks: Network[],
  filters: FilterOptions,
  selectedEdgeId: number | null,
  userName: string,
) {
  return networks.filter((network) => {
    // 국적 필터
    const matchesNationality =
      filters.nationality.includes("all") ||
      filters.nationality.includes(network.nationality) ||
      filters.nationality === "all" ||
      network.nationality === filters.nationality

    // 민족 필터
    const matchesEthnicity =
      filters.ethnicity.includes("all") ||
      filters.ethnicity.includes(network.ethnicity) ||
      filters.ethnicity === "all" ||
      network.ethnicity === filters.ethnicity

    // 연도 필터
    const matchesYearRange =
      network.migration_year >= filters.yearRange[0] &&
      network.migration_year <= filters.yearRange[1]

    // 이동연도(이주연도) 필터: migration_traces 중 하나라도 migrationYearRange에 포함되면 통과
    const matchesMigrationYearRange =
      !filters.migrationYearRange ||
      filters.migrationYearRange.length !== 2 ||
      network.migration_traces.some(
        (trace: any) =>
          trace.migration_year >= filters.migrationYearRange[0] &&
          trace.migration_year <= filters.migrationYearRange[1],
      )

    // 유저 네트워크 필터
    const matchesUserNetwork =
      !filters.userNetworkFilter || !userName || network.user_name === userName

    // 엣지 필터
    const matchesEdge =
      !selectedEdgeId ||
      network.edges.some((edge) => edge.targetId === selectedEdgeId)

    // 엔티티 타입 필터
    const matchesEntityType =
      filters.entityType === "all" || network.type === filters.entityType

    // 이주 원인 필터
    const matchesMigrationReasons =
      filters.migrationReasons.includes("all") ||
      filters.migrationReasons.length === 0 ||
      network.migration_traces.some((trace) =>
        filters.migrationReasons.includes(trace.reason),
      )

    return (
      matchesNationality &&
      matchesEthnicity &&
      matchesYearRange &&
      matchesMigrationYearRange && // 추가
      matchesUserNetwork &&
      matchesEdge &&
      matchesEntityType &&
      matchesMigrationReasons
    )
  })
}

// 중심성 계산 (예시: degree centrality)
function calculateCentrality(
  filteredNetworks: Network[],
  centralityType: string,
) {
  const centrality: Record<number, number> = {}
  if (centralityType === "degree") {
    filteredNetworks.forEach((network) => {
      centrality[network.id] = network.edges.length
    })
  } else if (centralityType === "none") {
    filteredNetworks.forEach((network) => {
      centrality[network.id] = 1
    })
  }
  // 필요시 다른 중심성도 추가
  return centrality
}

self.onmessage = function (e) {
  const { type, payload } = e.data

  if (type === "FILTER_NETWORKS") {
    const { networks, filters, userName, selectedEdgeId } = payload
    const filtered = filterNetworks(networks, filters, selectedEdgeId, userName)
    self.postMessage({ type: "FILTERED_NETWORKS", payload: filtered })
  }

  if (type === "CALCULATE_CENTRALITY") {
    const { filteredNetworks, centralityType } = payload
    const result = calculateCentrality(filteredNetworks, centralityType)
    self.postMessage({ type: "CENTRALITY_RESULT", payload: result })
  }
}
