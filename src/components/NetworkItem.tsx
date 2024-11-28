import { FC, memo } from "react"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid"
import useStore from "../store"
import { Network } from "../types"
import { useMutateNetwork } from "../hooks/useMutateNetwork"
import { useLocation, useNavigate } from "react-router-dom"

const NetworkItemMemo: FC<
  Omit<Network, "created_at" | "updated_at"> & {
    setFocusedNode: (node: { lat: number; lng: number }) => void
    handleEntityClick: (id: number) => void
  }
> = ({
  id,
  user_id,
  user_name,
  title,
  type,
  nationality,
  ethnicity,
  migration_year,
  end_year,
  latitude,
  longitude,
  connections,
  migration_traces, // 추가된 마이그레이션 트레이스
  setFocusedNode, // 반드시 포함
  handleEntityClick,
}) => {
  const updateNetwork = useStore((state) => state.updateEditedNetwork)
  const { deleteNetworkMutation } = useMutateNetwork()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <li className="my-3 px-2 py-2 bg-white rounded shadow-md text-xs w-full max-w-lg">
      <div className="flex justify-between items-center w-full max-w-lg">
        <span
          className="text-xs font-bold block p-4 border rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
          onClick={() =>
            location.pathname !== "/network"
              ? (setFocusedNode({ lat: latitude, lng: longitude }),
                handleEntityClick(id))
              : null
          }
        >
          No.{id} : {title}
        </span>
        <span className="font-bold text-xs flex justify-between items-center">
          Creator Name : {user_name}
        </span>
        <div className="flex ml-4">
          <PencilIcon
            className="h-4 w-4 mx-1 text-blue-500 cursor-pointer"
            onClick={() => {
              updateNetwork({
                id: id,
                title: title,
                type: type,
                nationality: nationality,
                ethnicity: ethnicity,
                migration_year: migration_year,
                end_year,
                latitude: latitude,
                longitude: longitude,
                connections: connections,
                migration_traces: migration_traces,
                user_id: 0,
              })
              window.location.href.includes("network")
                ? window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "instant",
                  })
                : navigate("/network")
            }}
          />
          <TrashIcon
            className="h-4 w-4 text-red-500 cursor-pointer"
            onClick={() => {
              if (
                window.confirm(`Are you sure you want to delete "${title}"?`)
              ) {
                deleteNetworkMutation.mutate(id)
              }
            }}
          />
        </div>
      </div>

      <div className="mt-2">
        <table className="table-auto w-full mt-2 border-collapse text-xs">
          <thead>
            <tr>
              <th className="px-1 py-1 border font-semibold text-center">
                Type
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                Nationality
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                Ethnicity
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                {type === "Migrant" ? "Birth Year" : "Established Year"}
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                {type === "Migrant" ? "Death Year" : "Dissolved Year"}
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                Lat
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                Lng
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-1 py-1 border text-center">{type}</td>
              <td className="px-1 py-1 border text-center truncate">
                {nationality}
              </td>
              <td className="px-1 py-1 border text-center truncate">
                {ethnicity}
              </td>
              <td className="px-1 py-1 border text-center">{migration_year}</td>
              <td className="px-1 py-1 border text-center">{end_year}</td>
              <td className="px-1 py-1 border text-center truncate">
                {latitude.toFixed(5)}
              </td>
              <td className="px-1 py-1 border text-center truncate">
                {longitude.toFixed(5)}
              </td>
            </tr>
          </tbody>
        </table>
        {/* 마이그레이션 트레이스 표시 */}
        <div className="mt-4">
          <strong>Migration Trace:</strong>
          {migration_traces && migration_traces.length > 0 ? (
            <div className="mt-2">
              <table className="table-auto w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border font-semibold text-center">
                      Location
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      Longitude
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      Latitude
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      Year
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {migration_traces.map((trace, index) => (
                    <tr key={index}>
                      <td className="px-2 py-1 border text-center">
                        {trace.location_name}
                      </td>
                      <td className="px-2 py-1 border text-center">
                        {trace.longitude}
                      </td>
                      <td className="px-2 py-1 border text-center">
                        {trace.latitude}
                      </td>
                      <td className="px-2 py-1 border text-center">
                        {trace.migration_year}
                      </td>
                      <td className="px-2 py-1 border text-center">
                        {trace.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-xs">No migration traces available.</p>
            </div>
          )}
        </div>

        {/* Render the connections */}
        <div className="mt-4">
          <strong>Connections:</strong>
          {connections?.length > 0 ? (
            <div className="mt-2">
              {connections?.map((connection, index) => (
                <div key={connection.targetId}>
                  <table className="table-auto w-full mt-2 border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 border font-semibold text-center">
                          Target ID
                        </th>
                        <th className="px-2 py-1 border font-semibold text-center">
                          Target Type
                        </th>
                        <th className="px-2 py-1 border font-semibold text-center">
                          Strength
                        </th>
                        <th className="px-2 py-1 border font-semibold text-center">
                          Connection Type
                        </th>
                        <th className="px-2 py-1 border font-semibold text-center">
                          Year
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-2 py-1 border text-center">
                          {connection.targetId}
                        </td>
                        <td className="px-2 py-1 border text-center">
                          {connection.targetType}
                        </td>
                        <td className="px-2 py-1 border text-center">
                          {connection.strength}
                        </td>
                        <td className="px-2 py-1 border text-center">
                          {connection.type}
                        </td>
                        <td className="px-2 py-1 border text-center">
                          {connection.year}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {index < connections.length - 1 && (
                    <div className="border-t my-2"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs">No connections available.</p>
          )}
        </div>
      </div>
    </li>
  )
}

export const NetworkItem = memo(NetworkItemMemo)
