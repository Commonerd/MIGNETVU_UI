import { FC, memo } from "react"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid"
import useStore from "../store"
import { Network } from "../types"
import { useMutateNetwork } from "../hooks/useMutateNetwork"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

const NetworkItemMemo: FC<
  Omit<Network, "created_at" | "updated_at"> & {
    setFocusedNode: (node: { lat: number; lng: number }) => void
    handleEntityClick: (id: number) => void
    handleMigrationTraceClick: (networkId: number) => void // 추가
    handleEdgeClick: (edgeId: number) => void // 추가
    handleNetworkEdgesToggle: (networkId: number) => void // 추가
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
  edges,
  migration_traces, // 추가된 마이그레이션 트레이스
  setFocusedNode, // 반드시 포함
  handleEntityClick,
  handleMigrationTraceClick,
  handleEdgeClick,
  handleNetworkEdgesToggle,
}) => {
  const updateNetwork = useStore((state) => state.updateEditedNetwork)
  const { deleteNetworkMutation } = useMutateNetwork()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [tooltipVisible, setTooltipVisible] = useState(false) // 툴팁 상태
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 }) // 툴팁 위치

  const handleNameClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 }) // 툴팁 위치 계산
    setTooltipVisible(!tooltipVisible) // 툴팁 표시/숨김 토글
  }

  return (
    <li className="my-3 px-2 py-2 bg-[#f2f2f2] rounded shadow-md text-xs w-full max-w-lg">
      <div className="flex justify-between items-center w-full max-w-lg">
        <span
          className="text-xs font-bold block p-4 border rounded-lg hover:bg-gray-100 transition-all cursor-pointer w-full sm:w-auto"
          onClick={
            (e) =>
              location.pathname !== "/network"
                ? (setFocusedNode({ lat: latitude, lng: longitude }),
                  handleEntityClick(id))
                : handleNameClick(e) // 툴팁 표시
          }
        >
          No.{id} : {title}
        </span>
        <span className="font-bold text-xs flex justify-between items-center">
          {t("Creator Name")} : {user_name}
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
                edge: edges,
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

      <div className="mt-2 overflow-x-auto">
        <table className="table-auto w-full mt-2 border-collapse text-xs">
          <thead>
            <tr>
              <th className="px-1 py-1 border font-semibold text-center">
                {t("Type")}
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                {t("Nationality")}
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                {t("Ethnicity")}
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                {type === "Migrant" ? t("Birth") : t("Established")}
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                {type === "Migrant" ? t("Death") : t("Dissolved")}
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                {t("Lat.")}
              </th>
              <th className="px-1 py-1 border font-semibold text-center">
                {t("Long.")}
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
          <div
            className="text-xs font-bold block p-4 border rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
            onClick={() => handleMigrationTraceClick(id)} // 클릭 이벤트 추가
          >
            <strong>{t("Migration Trace")}</strong>
          </div>
          {migration_traces && migration_traces.length > 0 ? (
            <div className="mt-2">
              <table className="table-auto w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border font-semibold text-center">
                      {t("Location")}
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      {t("Longitude")}
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      {t("Latitude")}
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      {t("Year")}
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      {t("Reason")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {migration_traces.map((trace, index) => (
                    <tr
                      key={index}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleMigrationTraceClick(id)} // 클릭 이벤트 추가
                    >
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
              <p className="text-xs">{t("No migration traces available.")}</p>
            </div>
          )}
        </div>

        {/* Render the connections */}
        <div className="mt-4">
          <div
            className="text-xs font-bold block p-4 border rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
            onClick={() => handleNetworkEdgesToggle(id)} // 엣지 표제어 클릭 이벤트 추가
          >
            <strong>{t("Edges")}</strong>
          </div>
          {edges?.length > 0 ? (
            <div className="mt-2">
              <table className="table-auto w-full mt-2 border-collapse text-xs">
                <thead
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleEdgeClick(id)} // 테이블 헤더 클릭 이벤트 추가
                >
                  <tr>
                    <th className="px-2 py-1 border font-semibold text-center">
                      {t("Target ID")}
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      {t("Target Type")}
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      {t("Strength")}
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      {t("Connection Type")}
                    </th>
                    <th className="px-2 py-1 border font-semibold text-center">
                      {t("Year")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {edges.map((edge, index) => (
                    <tr
                      key={edge.targetId}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleEdgeClick(edge.targetId)} // 개별 엣지 클릭 이벤트
                    >
                      <td className="px-2 py-1 border text-center">
                        {edge.targetId}
                      </td>
                      <td className="px-2 py-1 border text-center">
                        {edge.targetType}
                      </td>
                      <td className="px-2 py-1 border text-center">
                        {edge.strength}
                      </td>
                      <td className="px-2 py-1 border text-center">
                        {edge.edgeType}
                      </td>
                      <td className="px-2 py-1 border text-center">
                        {edge.year}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs">{t("No edges available.")}</p>
          )}
        </div>
      </div>
    </li>
  )
}

export const NetworkItem = memo(NetworkItemMemo)
