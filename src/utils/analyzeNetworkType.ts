import { Network } from "../types"
import { calculateCentrality } from "./centralityUtils"

export const analyzeNetworkType = (
  networks: Network[],
  edges: any[],
  traces: any[],
) => {
  const analysisResult: string[] = []

  const numNodes = networks.length
  const numEdges = edges.length

  // 중심성 분석 (Degree Centrality)
  const degreeCentrality = calculateCentrality(networks, "degree")
  const maxDegree = Math.max(...Object.values(degreeCentrality))
  const avgDegree =
    Object.values(degreeCentrality).reduce((sum, val) => sum + val, 0) /
    numNodes

  if (maxDegree > numNodes * 0.3) {
    analysisResult.push("Hub-Dominated Network")
  }
  analysisResult.push(`Average Degree Centrality: ${avgDegree.toFixed(2)}`)

  // 연결성 분석 (Network Density)
  const maxPossibleEdges = (numNodes * (numNodes - 1)) / 2
  const density = numEdges / maxPossibleEdges
  if (density > 0.5) {
    analysisResult.push("*Dense Network: high connectivity")
  } else if (density < 0.1) {
    analysisResult.push("*Sparse Network: weak connectivity")
  }
  analysisResult.push(`Network Density: ${density.toFixed(2)}`)

  //   // 연결된 구성 요소 분석 (Connected Components)
  //   const visited = new Set<number>()
  //   const components: number[][] = []

  //   const dfs = (nodeId: number, component: number[]) => {
  //     visited.add(nodeId)
  //     component.push(nodeId)
  //     const neighbors = edges
  //       .filter((edge) => edge.sourceId === nodeId || edge.targetId === nodeId)
  //       .map((edge) => (edge.sourceId === nodeId ? edge.targetId : edge.sourceId))
  //     neighbors.forEach((neighbor) => {
  //       if (!visited.has(neighbor)) {
  //         dfs(neighbor, component)
  //       }
  //     })
  //   }

  //   networks.forEach((node) => {
  //     if (!visited.has(node.id)) {
  //       const component: number[] = []
  //       dfs(node.id, component)
  //       components.push(component)
  //     }
  //   })

  //   if (components.length > 1) {
  //     analysisResult.push(
  //       `*Disconnected Network: Contains ${components.length} connected components.`,
  //     )
  //   } else {
  //     analysisResult.push(
  //       "*Connected Network: All nodes are part of a single component.",
  //     )
  //   }

  // 이동성 분석 (Mobility Patterns)
  const totalTraces = traces.length
  const avgTracesPerNode = totalTraces / numNodes
  if (avgTracesPerNode > 2) {
    analysisResult.push("High Mobility Activity")
  } else if (avgTracesPerNode === 0) {
    analysisResult.push("No Observed Mobility")
  }
  analysisResult.push(`Average Traces Per Node: ${avgTracesPerNode.toFixed(2)}`)

  //   // 클러스터링 계수 (Clustering Coefficient)
  //   const clusteringCoefficients = networks.map((node) => {
  //     const neighbors = (node.edges || []).map((edge) => edge.targetId)
  //     const neighborEdges = edges.filter(
  //       (edge) =>
  //         neighbors.includes(edge.sourceId) && neighbors.includes(edge.targetId),
  //     )
  //     const possibleConnections = (neighbors.length * (neighbors.length - 1)) / 2
  //     return possibleConnections > 0
  //       ? neighborEdges.length / possibleConnections
  //       : 0
  //   })
  //   const avgClusteringCoefficient =
  //     clusteringCoefficients.reduce((sum, coeff) => sum + coeff, 0) /
  //     clusteringCoefficients.length
  //   if (avgClusteringCoefficient > 0.5) {
  //     analysisResult.push(
  //       "High Clustering Coefficient: Indicates tightly-knit communities.",
  //     )
  //   } else {
  //     analysisResult.push(
  //       "Low Clustering Coefficient: Suggests a lack of community structure.",
  //     )
  //   }
  //   analysisResult.push(
  //     `Average Clustering Coefficient: ${avgClusteringCoefficient.toFixed(
  //       2,
  //     )} (Indicates the overall tendency of nodes to form clusters.)`,
  //   )

  return analysisResult
}
