/* eslint-disable no-restricted-globals */

// 네트워크 필터링 및 중심성 계산 워커

// export type Network = {
//   id: number
//   nationality: string
//   ethnicity: string
//   migration_year: number
//   user_name: string
//   type: string
//   edges: { edgeType: string; targetId: number }[]
//   migration_traces: { reason: string }[]
// }

// export type FilterOptions = {
//   nationality: string[] | string
//   ethnicity: string[] | string
//   edgeType: string[] | string
//   entityType: string
//   yearRange: [number, number]
//   migrationYearRange: [number, number] // 추가
//   userNetworkFilter: boolean
//   userNetworkTraceFilter: boolean
//   userNetworkConnectionFilter: boolean
//   migrationReasons: string[]
//   selectedMigrationNetworkId: number | null
// }

function filterNetworks(networks, filters, selectedEdgeId, userName) {
  const total = networks.length
  let filtered = []
  self.postMessage({ type: "PROGRESS", payload: 0 })

  networks.forEach((network, idx) => {
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
        (trace) =>
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
      filters.entityType === "all" ||
      (Array.isArray(filters.entityType)
        ? filters.entityType.includes("all") ||
          filters.entityType.includes(network.type)
        : network.type === filters.entityType)

    // 엣지 타입 필터 (멀티 지원)
    let matchesEdgeType = true
    if (
      filters.edgeType &&
      filters.edgeType.length > 0 &&
      !filters.edgeType.includes("all")
    ) {
      matchesEdgeType = network.edges.some((edge) =>
        Array.isArray(filters.edgeType)
          ? filters.edgeType.includes(edge.edgeType)
          : filters.edgeType === edge.edgeType,
      )
    }

    // 이주 원인 필터
    const matchesMigrationReasons =
      filters.migrationReasons.includes("all") ||
      filters.migrationReasons.length === 0 ||
      network.migration_traces.some((trace) =>
        filters.migrationReasons.includes(trace.reason),
      )

    // 여러 네트워크 필터
    const matchesSelectedMigrationNetworks =
      !filters.selectedMigrationNetworkIds ||
      filters.selectedMigrationNetworkIds.length === 0 ||
      filters.selectedMigrationNetworkIds.includes(network.id)

    const matches =
      matchesNationality &&
      matchesEthnicity &&
      matchesYearRange &&
      matchesMigrationYearRange &&
      matchesUserNetwork &&
      matchesEdge &&
      matchesEntityType &&
      matchesMigrationReasons &&
      matchesSelectedMigrationNetworks &&
      matchesEdgeType // 추가

    if (matches) filtered.push(network)

    // 5% 단위로 진행률 메시지 전송 (혹은 100개마다 등)
    if (idx % Math.ceil(total / 20) === 0 || idx === total - 1) {
      const percent = Math.round(((idx + 1) / total) * 100)

      self.postMessage({ type: "PROGRESS", payload: percent })
    }
  })

  return filtered
}

// 중심성 계산 (예시: degree centrality)
function calculateCentrality(filteredNetworks, centralityType) {
  const centrality = {}
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
    self.postMessage({ type: "PROGRESS", payload: 0 }) // 반드시 0부터 시작!
    const filtered = filterNetworks(
      payload.networks,
      payload.filters,
      payload.selectedEdgeId,
      payload.userName,
    )
    self.postMessage({ type: "FILTERED_NETWORKS", payload: filtered })
    self.postMessage({ type: "PROGRESS", payload: 100 }) // 마지막에 100!
  }

  if (type === "CALCULATE_CENTRALITY") {
    const { filteredNetworks, centralityType } = payload
    const result = calculateCentrality(filteredNetworks, centralityType)
    self.postMessage({ type: "CENTRALITY_RESULT", payload: result })
  }
}
