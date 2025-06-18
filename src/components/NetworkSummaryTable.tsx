import React from "react"

export default function NetworkSummaryTable({ networks }: { networks: any[] }) {
  if (!networks || networks.length === 0) return <p>No data</p>
  return (
    <section>
      <h2>Network Summary</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Nationality</th>
            <th>Ethnicity</th>
            <th>Migration Year</th>
            <th>Edges</th>
          </tr>
        </thead>
        <tbody>
          {networks.map((n) => (
            <tr key={n.id}>
              <td>{n.id}</td>
              <td>{n.title}</td>
              <td>{n.type}</td>
              <td>{n.nationality}</td>
              <td>{n.ethnicity}</td>
              <td>{n.migration_year}</td>
              <td>{n.edges?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
