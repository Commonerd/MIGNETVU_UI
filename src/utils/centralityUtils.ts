export interface Network {
  id: number
  edges: {
    targetId: number
    strength: number
  }[]
}

export const calculateCentrality = (
  networks: Network[],
  centralityType: string,
): { [id: number]: number } => {
  let centrality: { [id: number]: number } = {}
  const connectionsMap: { [id: number]: number[] } = {}

  // Build a connections map using edges
  networks.forEach((entity) => {
    connectionsMap[entity.id] = (entity.edges || []).map(
      (edge) => edge.targetId,
    )
  })

  switch (centralityType) {
    case "degree":
      for (const id in connectionsMap) {
        centrality[id] = 0
      }

      for (const id in connectionsMap) {
        // Outbound edges
        centrality[id] += connectionsMap[id].reduce((sum, neighborId) => {
          const edge = networks
            .find((n) => n.id === Number(id))
            ?.edges.find((e) => e.targetId === neighborId)
          return sum + (edge ? edge.strength : 1)
        }, 0)

        // Inbound edges
        for (const neighborId in connectionsMap) {
          if (connectionsMap[neighborId].includes(Number(id))) {
            const edge = networks
              .find((n) => n.id === Number(neighborId))
              ?.edges.find((e) => e.targetId === Number(id))
            centrality[id] += edge ? edge.strength : 1
          }
        }
      }
      break

    case "betweenness":
      for (const id in connectionsMap) {
        centrality[id] = 0
      }

      for (const startId in connectionsMap) {
        const shortestPaths: { [id: number]: number } = {}
        const distances: { [id: number]: number } = {}
        const predecessors: { [id: number]: number[] } = {}
        const queue: number[] = []
        const visited: Set<number> = new Set()

        // Initialize
        Object.keys(connectionsMap).forEach((id) => {
          distances[Number(id)] = Infinity
          shortestPaths[Number(id)] = 0
          predecessors[Number(id)] = []
        })

        distances[Number(startId)] = 0
        shortestPaths[Number(startId)] = 1
        queue.push(Number(startId))

        // Dijkstra-based shortest path search
        while (queue.length > 0) {
          const current = queue.shift()!
          visited.add(current)

          connectionsMap[current].forEach((neighbor) => {
            const edge = networks
              .find((n) => n.id === current)
              ?.edges.find((e) => e.targetId === neighbor)
            const weight = edge ? edge.strength : 1

            const newDistance = distances[current] + weight

            if (newDistance < distances[neighbor]) {
              distances[neighbor] = newDistance
              predecessors[neighbor] = [current]
              shortestPaths[neighbor] = shortestPaths[current]
              if (!visited.has(neighbor)) queue.push(neighbor)
            } else if (newDistance === distances[neighbor]) {
              predecessors[neighbor].push(current)
              shortestPaths[neighbor] += shortestPaths[current]
            }
          })
        }

        // Calculate betweenness centrality
        const dependency: { [id: number]: number } = {}
        Object.keys(predecessors).forEach((id) => {
          dependency[Number(id)] = 0
        })

        const nodes = Object.keys(predecessors)
          .map(Number)
          .sort((a, b) => distances[b] - distances[a])

        nodes.forEach((w) => {
          predecessors[w].forEach((v) => {
            const fraction =
              (shortestPaths[v] / shortestPaths[w]) * (1 + dependency[w])
            dependency[v] += fraction
          })

          if (w !== Number(startId)) {
            centrality[w] += dependency[w]
          }
        })
      }

      // Normalize betweenness centrality
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
      const numNodes = Object.keys(connectionsMap).length
      let eigenCentrality: { [id: number]: number } = {}
      let prevEigenCentrality: { [id: number]: number } = {}

      Object.keys(connectionsMap).forEach((id) => {
        eigenCentrality[Number(id)] = 1 / Math.sqrt(numNodes)
      })

      const maxIterations = 100
      const tolerance = 1e-6
      let delta = Infinity
      let iterations = 0

      while (delta > tolerance && iterations < maxIterations) {
        prevEigenCentrality = { ...eigenCentrality }
        delta = 0

        for (const id in connectionsMap) {
          let sum = 0

          connectionsMap[Number(id)].forEach((neighbor) => {
            const edge = networks
              .find((n) => n.id === Number(id))
              ?.edges.find((e) => e.targetId === neighbor)
            const weight = edge ? edge.strength : 1
            sum += prevEigenCentrality[neighbor] * weight
          })

          for (const neighborId in connectionsMap) {
            if (connectionsMap[neighborId].includes(Number(id))) {
              const edge = networks
                .find((n) => n.id === Number(neighborId))
                ?.edges.find((e) => e.targetId === Number(id))
              const weight = edge ? edge.strength : 1
              sum += prevEigenCentrality[Number(neighborId)] * weight
            }
          }

          eigenCentrality[Number(id)] = sum
        }

        const norm = Math.sqrt(
          Object.values(eigenCentrality).reduce(
            (acc, val) => acc + val * val,
            0,
          ),
        )
        for (const id in eigenCentrality) {
          eigenCentrality[Number(id)] /= norm || 1
        }

        Object.keys(eigenCentrality).forEach((id) => {
          delta += Math.abs(
            eigenCentrality[Number(id)] - prevEigenCentrality[Number(id)],
          )
        })

        iterations++
      }

      centrality = eigenCentrality
      break
  }

  return centrality
}

const bfsShortestPath = (
  startId: number,
  connectionsMap: { [id: number]: number[] },
): { [id: number]: number } => {
  const queue: [number, number][] = [[startId, 0]]
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
