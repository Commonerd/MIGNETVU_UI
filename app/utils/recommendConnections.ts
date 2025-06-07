import { Network } from "../types"
import { buildMcpContext } from "./mcpContext"

// 유사도 계산 (속성이 같으면 +1)
function calcSimilarity(a: any, b: any) {
  let score = 0
  if (a.nationality && a.nationality === b.nationality) score += 1
  if (a.ethnicity && a.ethnicity === b.ethnicity) score += 1
  if (a.type && a.type === b.type) score += 1
  // 이주연도 ±5년 이내면 +1
  if (
    a.migrationYear &&
    b.migrationYear &&
    Math.abs(a.migrationYear - b.migrationYear) <= 5
  )
    score += 1
  return score
}

// 추천 함수
export function recommendConnections(
  target: Network,
  allNetworks: Network[],
  topN = 3,
) {
  const targetCtx = buildMcpContext(target)
  // 자기 자신, 이미 연결된 대상 제외
  const connectedIds = new Set(
    (target.connections || []).map((c) => c.targetId),
  )
  const candidates = allNetworks.filter(
    (n) => n.id !== target.id && !connectedIds.has(n.id),
  )
  // 유사도 계산
  const scored = candidates.map((n) => ({
    network: n,
    score: calcSimilarity(targetCtx, buildMcpContext(n)),
  }))
  // 점수순 정렬 후 상위 N개 반환
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.network)
}
