import React, { useState, useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Tooltip,
} from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  Migrant,
  Organization,
  EntityType,
  Connection,
  FilterOptions,
} from '../types'
import { mockMigrants, mockOrganizations } from '../mockData'
import { members } from '../members'
import styled from 'styled-components'
import useStore from '../store'

// 중심 노드로 포커스 이동
const FocusMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 4, {
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
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
})

// 범례 컴포넌트 생성
const Legend = ({
  topMigrants,
  topOrganizations,
  onEntityClick,
  centralityType,
}: {
  topMigrants: { id: number; name: string; centrality: number }[]
  topOrganizations: { id: number; name: string; centrality: number }[]
  onEntityClick: (id: number, type: EntityType) => void
  centralityType: string
}) => {
  const map = useMap()
  const { t } = useTranslation()

  useEffect(() => {
    const legend = new L.Control({ position: 'topright' })

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend')

      div.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'
      div.style.padding = '10px'
      div.style.borderRadius = '5px'
      div.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)'

      const labels = [
        `<div style="display: inline-block; width: 15px; height: 15px; background-color: red; border-radius: 50%; margin-right: 5px;"></div> ${t(
          'migrant',
        )}`,
        `<div style="display: inline-block; width: 15px; height: 15px; background-color: blue; border-radius: 50%; margin-right: 5px;"></div> ${t(
          'organization',
        )}`,
        `<div style="display: inline-block; width: 15px; height: 5px; background-color: blue; margin-right: 5px;"></div> ${t(
          'friend',
        )}`,
        `<div style="display: inline-block; width: 15px; height: 5px; background-color: green; margin-right: 5px;"></div> ${t(
          'colleague',
        )}`,
        `<div style="display: inline-block; width: 15px; height: 5px; background-color: red; margin-right: 5px;"></div> ${t(
          'family',
        )}`,
        `<div style="display: inline-block; width: 15px; height: 5px; background-color: purple; margin-right: 5px;"></div> ${t(
          'professional',
        )}`,
        `<div style="display: inline-block; width: 15px; height: 5px; background-color: orange; margin-right: 5px;"></div> ${t(
          'cultural',
        )}`,
      ]

      div.innerHTML = labels.join('<br>')
      if (centralityType !== 'none') {
        const topMigrantsHtml = topMigrants
          .map(
            (entity, index) =>
              `<div style="cursor: pointer;" data-id="${
                entity.id
              }" data-type="migrant">${index + 1}. ${
                entity.name
              }: ${entity.centrality.toFixed(2)}</div>`,
          )
          .join('')
        const topOrganizationsHtml = topOrganizations
          .map(
            (entity, index) =>
              `<div style="cursor: pointer;" data-id="${
                entity.id
              }" data-type="organization">${index + 1}. ${
                entity.name
              }: ${entity.centrality.toFixed(2)}</div>`,
          )
          .join('')
        div.innerHTML += `<br><br><strong>${t(
          'topMigrants',
        )}</strong><br>${topMigrantsHtml}`
        div.innerHTML += `<br><strong>${t(
          'topOrganizations',
        )}</strong><br>${topOrganizationsHtml}`
      }

      return div
    }

    legend.addTo(map)

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const id = target.getAttribute('data-id')
      const type = target.getAttribute('data-type') as EntityType
      if (id && type) {
        onEntityClick(Number(id), type)
      }
    }

    map.getContainer().addEventListener('click', handleClick)

    return () => {
      map.getContainer().removeEventListener('click', handleClick)
      legend.remove()
    }
  }, [map, t, topMigrants, topOrganizations, centralityType, onEntityClick])

  return null
}

const Map: React.FC = () => {
  const { t } = useTranslation()
  const [migrants, setMigrants] = useState<Migrant[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filters, setFilters] = useState<FilterOptions>({
    nationality: 'all',
    ethnicity: 'all',
    connectionType: 'all',
    entityType: 'all',
    yearRange: [1800, new Date().getFullYear()], // 현재 연도를 자동으로 설정
  })
  const [centralityType, setCentralityType] = useState<string>('none')
  const [highlightedNode, setHighlightedNode] = useState<{
    id: number
    type: EntityType
  } | null>(null)
  const [focusedNode, setFocusedNode] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const { user } = useStore()

  useEffect(() => {
    setMigrants(mockMigrants)
    setOrganizations(mockOrganizations)
  }, [])

  const handleEntityClick = (id: number, type: EntityType) => {
    const entity = getEntityById(id, type)
    if (entity) {
      setFocusedNode({ lat: entity.latitude, lng: entity.longitude })
    }
    setHighlightedNode((prev) => {
      if (prev && prev.id === id && prev.type === type) {
        return null
      }
      return { id, type }
    })
  }

  const getEntityById = (
    id: number,
    type: EntityType,
  ): Migrant | Organization | undefined => {
    return type === 'migrant'
      ? migrants.find((m) => m.id === id)
      : organizations.find((o) => o.id === id)
  }

  const getConnectionColor = (type: Connection['type']) => {
    switch (type) {
      case 'friend':
        return 'blue'
      case 'colleague':
        return 'green'
      case 'family':
        return 'red'
      case 'professional':
        return 'purple'
      case 'cultural':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const getEdges = () => {
    const edges: any[] = []
    const addEdges = (entity: Migrant | Organization) => {
      entity.connections.forEach((connection) => {
        if (
          filters.connectionType === 'all' ||
          connection.type === filters.connectionType
        ) {
          const target = getEntityById(
            connection.targetId,
            connection.targetType,
          )
          if (target) {
            edges.push([
              [entity.latitude, entity.longitude],
              [target.latitude, target.longitude],
              getConnectionColor(connection.type),
              connection.strength,
              connection.type,
            ])
          }
        }
      })
    }

    if (filters.entityType === 'all' || filters.entityType === 'migrant') {
      migrants.forEach((migrant) => {
        if (
          (filters.nationality === 'all' ||
            migrant.nationality === filters.nationality) &&
          (filters.ethnicity === 'all' ||
            migrant.ethnicity === filters.ethnicity) &&
          migrant.migrationYear >= filters.yearRange[0] &&
          migrant.migrationYear <= filters.yearRange[1]
        ) {
          addEdges(migrant)
        }
      })
    }

    if (filters.entityType === 'all' || filters.entityType === 'organization') {
      organizations.forEach((org) => {
        if (
          org.foundationYear >= filters.yearRange[0] &&
          org.foundationYear <= filters.yearRange[1]
        ) {
          addEdges(org)
        }
      })
    }

    return edges
  }

  const handleFilterChange = (
    key: keyof FilterOptions,
    value: string | number[],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const filteredMigrants = migrants.filter(
    (migrant) =>
      (filters.nationality === 'all' ||
        migrant.nationality === filters.nationality) &&
      (filters.ethnicity === 'all' ||
        migrant.ethnicity === filters.ethnicity) &&
      migrant.migrationYear >= filters.yearRange[0] &&
      migrant.migrationYear <= filters.yearRange[1],
  )

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
    ;[...migrants, ...organizations].forEach((entity) => {
      connectionsMap[entity.id] = entity.connections.map(
        (connection) => connection.targetId,
      )
    })

    switch (centralityType) {
      case 'degree':
        for (const id in connectionsMap) {
          centrality[id] = connectionsMap[id].length
        }
        break

      case 'betweenness':
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

      case 'closeness':
        for (const id in connectionsMap) {
          const distances = bfsShortestPath(Number(id), connectionsMap)
          const totalDistance = Object.values(distances).reduce(
            (acc, d) => acc + d,
            0,
          )
          centrality[id] = totalDistance > 0 ? 1 / totalDistance : 0
        }
        break

      case 'eigenvector':
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

  const topMigrants = Object.entries(centralityValues)
    .filter(([id]) => migrants.some((m) => m.id === Number(id)))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, centrality]) => {
      const migrant = migrants.find((m) => m.id === Number(id))
      return {
        id: Number(id),
        name: migrant ? migrant.name : 'Unknown',
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
        name: organization ? organization.name : 'Unknown',
        centrality,
      }
    })

  const getNodeSize = (centrality: number, centralityType: string) => {
    let baseSize = 10
    let scaleFactor = 5

    if (centralityType === 'degree') {
      scaleFactor = 3
    } else if (
      centralityType === 'closeness' ||
      centralityType === 'eigenvector'
    ) {
      scaleFactor = 30
    } else if (centralityType === 'betweenness') {
      scaleFactor = 500
    }

    return Math.max(baseSize, centrality * scaleFactor + baseSize)
  }

  // 등록자별 노드 수 계산
  const registrantNodeCounts = [...migrants, ...organizations].reduce(
    (acc, entity) => {
      acc[entity.registrantId] = (acc[entity.registrantId] || 0) + 1
      return acc
    },
    {} as { [registrantId: number]: number },
  )

  // 등록자 이름을 매핑하는 함수
  const getRegistrantName = (id: number) => {
    const registrant = members.find((r) => r.id === id)
    return registrant ? registrant?.name : 'Unknown'
  }

  // 상위 3명의 등록자 추출 및 정렬
  const topRegistrants = Object.entries(registrantNodeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([registrantId, count], index) => ({
      registrantId: Number(registrantId),
      name: getRegistrantName(Number(registrantId)),
      count,
      medal: index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉',
    }))

  return (
    <div className="h-[calc(85vh-64px)] relative">
      <div className="p-4 bg-white">
        <div className="flex flex-wrap gap-1 md:gap-4 items-center">
          <select
            value={filters.entityType}
            onChange={(e) => handleFilterChange('entityType', e.target.value)}
            className="p-1 md:p-2 border rounded text-xs md:text-sm w-28 md:w-32 h-8 md:h-10"
          >
            <option value="all">{t('allEntityTypes')}</option>
            <option value="migrant">{t('migrant')}</option>
            <option value="organization">{t('organization')}</option>
          </select>
          {filters.entityType !== 'organization' && (
            <>
              <select
                value={filters.nationality}
                onChange={(e) =>
                  handleFilterChange('nationality', e.target.value)
                }
                className="p-1 md:p-2 border rounded text-xs md:text-sm w-28 md:w-32 h-8 md:h-10"
              >
                <option value="all">{t('allNationalities')}</option>
                {uniqueNationalities.map((nationality) => (
                  <option key={nationality} value={nationality}>
                    {nationality}
                  </option>
                ))}
              </select>
              <select
                value={filters.ethnicity}
                onChange={(e) =>
                  handleFilterChange('ethnicity', e.target.value)
                }
                className="p-1 md:p-2 border rounded text-xs md:text-sm w-28 md:w-32 h-8 md:h-10"
              >
                <option value="all">{t('allEthnicities')}</option>
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
              handleFilterChange('connectionType', e.target.value)
            }
            className="p-1 md:p-2 border rounded text-xs md:text-sm w-28 md:w-32 h-8 md:h-10"
          >
            <option value="all">{t('allConnectionTypes')}</option>
            <option value="friend">{t('friend')}</option>
            <option value="colleague">{t('colleague')}</option>
            <option value="family">{t('family')}</option>
            <option value="professional">{t('professional')}</option>
            <option value="cultural">{t('cultural')}</option>
          </select>
          <div>
            <label className="text-xs md:text-sm">{t('yearRange')}: </label>
            <input
              type="number"
              value={filters.yearRange[0]}
              onChange={(e) =>
                handleFilterChange('yearRange', [
                  parseInt(e.target.value),
                  filters.yearRange[1],
                ])
              }
              className="w-12 md:w-20 p-1 md:p-2 border rounded text-xs md:text-sm"
            />
            <span className="text-xs md:text-sm"> - </span>
            <input
              type="number"
              value={filters.yearRange[1]}
              onChange={(e) =>
                handleFilterChange('yearRange', [
                  filters.yearRange[0],
                  parseInt(e.target.value),
                ])
              }
              className="w-12 md:w-20 p-1 md:p-2 border rounded text-xs md:text-sm"
            />
          </div>
          {user.isLoggedIn ? (
            <>
              {' '}
              <select
                value={centralityType}
                onChange={(e) => setCentralityType(e.target.value)}
                className="p-1 md:p-2 border rounded text-xs md:text-sm w-28 md:w-32 h-8 md:h-10"
              >
                <option value="none">{t('selectCentrality')}</option>
                <option value="degree">{t('degreeCentrality')}</option>
                <option value="betweenness">{t('betweenessCentrality')}</option>
                <option value="closeness">{t('closenessCentrality')}</option>
                <option value="eigenvector">
                  {t('eigenvectorCentrality')}
                </option>
              </select>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      <MapContainer
        center={[37.5665, 126.978]}
        zoom={2}
        style={{ height: 'calc(100% - 60px)', width: '100%' }}
      >
        {focusedNode && (
          <FocusMap lat={focusedNode.lat} lng={focusedNode.lng} />
        )}
        <LegendBox>
          <h2>{t('topRegistrants')}</h2>
          <ul>
            {topRegistrants.map((registrant) => (
              <li key={registrant.registrantId}>
                {registrant.medal} {registrant.name} : {registrant.count}{' '}
                {t('nodeCount')}
              </li>
            ))}
          </ul>
        </LegendBox>
        <Legend
          topMigrants={topMigrants}
          topOrganizations={topOrganizations}
          onEntityClick={handleEntityClick}
          centralityType={centralityType}
        />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {(filters.entityType === 'all' || filters.entityType === 'migrant') &&
          filteredMigrants.map((migrant) => {
            const size = getNodeSize(
              centralityValues[migrant.id] || 0,
              centralityType,
            )

            const isHighlighted =
              highlightedNode &&
              highlightedNode.id === migrant.id &&
              highlightedNode.type === 'migrant'

            return (
              <Marker
                key={`migrant-${migrant.id}`}
                position={[migrant.latitude, migrant.longitude]}
                icon={L.divIcon({
                  className: 'custom-marker',
                  html: `<div style="width: ${size}px; height: ${size}px; background-color: ${
                    isHighlighted ? 'yellow' : 'red'
                  }; border-radius: 50%;"></div>`,
                  iconSize: [size, size],
                })}
              >
                <Tooltip>
                  <h2 className="text-lg font-bold">{migrant.name}</h2>
                  <p>id : {migrant.id} </p>
                  <p>
                    {t('registrantId')} : {migrant.registrantId}
                  </p>
                  <p>
                    {t('centrality')}: {centralityValues[migrant.id] || 0}
                  </p>
                  <p>
                    {t('nationality')}: {migrant.nationality}
                  </p>
                  <p>
                    {t('ethnicity')}: {migrant.ethnicity}
                  </p>
                  <p>
                    {t('migrationYear')}: {migrant.migrationYear}
                  </p>
                  <p>
                    {t('age')}: {migrant.age}
                  </p>
                  <p>
                    {t('occupation')}: {migrant.occupation}
                  </p>
                  <p>
                    {t('education')}: {migrant.education}
                  </p>
                  <p>
                    {t('languagesSpoken')}: {migrant.languagesSpoken.join(', ')}
                  </p>
                </Tooltip>
              </Marker>
            )
          })}
        {(filters.entityType === 'all' ||
          filters.entityType === 'organization') &&
          filteredOrganizations.map((org) => {
            const size = getNodeSize(
              centralityValues[org.id] || 0,
              centralityType,
            )
            const isHighlighted =
              highlightedNode &&
              highlightedNode.id === org.id &&
              highlightedNode.type === 'organization'
            return (
              <Marker
                key={`org-${org.id}`}
                position={[org.latitude, org.longitude]}
                icon={L.divIcon({
                  className: 'custom-marker',
                  html: `<div style="width: ${size}px; height: ${size}px; background-color: ${
                    isHighlighted ? 'yellow' : 'blue'
                  }; border-radius: 50%;"></div>`,
                  iconSize: [size, size],
                })}
              >
                <Tooltip>
                  <div>
                    <h2 className="text-lg font-bold">{org.name}</h2>
                    <p>id: {org.id} </p>
                    <p>
                      {t('registrantId')} : {org.registrantId}
                    </p>
                    <p>
                      {t('centrality')}: {centralityValues[org.id] || 0}
                    </p>
                    <p>
                      {t('foundationYear')}: {org.foundationYear}
                    </p>
                    <p>
                      {t('type')}: {org.type}
                    </p>
                    <p>
                      {t('mission')}: {org.mission}
                    </p>
                    <p>
                      {t('services')}: {org.services.join(', ')}
                    </p>
                    <p>
                      {t('contactInfo')}: {org.contactInfo}
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
                  {`${t('connectionType')}: ${t(String(edge[4]))}`}
                  <br />
                  {`${t('connectionStrength')}: ${edge[3]}`}{' '}
                </span>
              </Tooltip>
            </Polyline>
          )
        })}
      </MapContainer>
    </div>
  )
}

const LegendBox = styled.div`
  position: relative;
  top: 0.5rem;
  left: 2rem;
  width: 10rem; /* 가로 길이 설정 */
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
