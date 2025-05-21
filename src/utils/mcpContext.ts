export function buildMcpContext(network: Network) {
  return {
    type: network.type,
    nationality: network.nationality,
    ethnicity: network.ethnicity,
    migrationYear: network.migration_year,
    endYear: network.end_year,
    latitude: network.latitude,
    longitude: network.longitude,
    edges: network.edges,
    migrationTraces: network.migration_traces,
  }
}
