import { Network } from "../types"
import { calculateCentrality } from "./centralityUtils"

export const analyzeNetworkType = (
  networks: Network[],
  edges: any[],
  traces: any[],
) => {
  const analysisResult: string[] = []

  // 중심성 분석
  const centralityValues = calculateCentrality(networks, "degree")
  const highCentralityNodes = Object.entries(centralityValues)
    .filter(([_, value]) => value > 5) // 중심성이 5 이상인 노드
    .map(([id]) => id)

  if (highCentralityNodes.length > 0) {
    analysisResult.push("High Centrality Network")
  }

  // 연결성 분석
  const totalEdges = edges.length
  if (totalEdges > networks.length * 2) {
    analysisResult.push("Highly Connected Network")
  } else if (totalEdges < networks.length) {
    analysisResult.push("Sparse Network")
  }

  // 이동 패턴 분석
  const totalTraces = traces.length
  if (totalTraces > networks.length) {
    analysisResult.push("Dynamic Mobitity")
  } else if (totalTraces === 0) {
    analysisResult.push("Static Mobility")
  }

  return analysisResult
}
