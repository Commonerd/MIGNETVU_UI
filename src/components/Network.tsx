import { FormEvent, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid"
import useStore from "../store"
import { useQueryAllNetworksOnMap } from "../hooks/useQueryNetworks"
import { useMutateNetwork } from "../hooks/useMutateNetwork"
import SearchResults from "./SearchResults"
import { useTranslation } from "react-i18next"
import { GlobeIcon } from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ClipLoader } from "react-spinners"
import * as XLSX from "xlsx"
import { fetchAllComments } from "../api/comments"
import { useRouter } from "next/router"

export const Network = () => {
  const { t } = useTranslation()
  const { editedNetwork } = useStore()
  const updateNetwork = useStore((state) => state.updateEditedNetwork)
  const { data } = useQueryAllNetworksOnMap()
  const { createNetworkMutation, updateNetworkMutation } = useMutateNetwork()
  const [searchQuery, setSearchQuery] = useState("")
  const [triggerSearch, setTriggerSearch] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBirthComplete, setIsBirthComplete] = useState(false) // 상태로 Birth/Death 전환 관리
  const [isLatitudeComplete, setIsLatitudeComplete] = useState(false) // 상태로 Birth/Death 전환 관리
  const [isTargetIdComplete, setIsTargetIdComplete] = useState(false) // 상태로 Birth/Death 전환 관리

  const navigate = useRouter()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const submitNetworkHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const {
      id,
      title,
      type,
      nationality,
      ethnicity,
      migration_year,
      end_year,
      latitude,
      longitude,
      connections,
      edge,
      user_id,
      migration_traces,
      photo,
    } = editedNetwork

    // Ensure type is either 'Person' or 'Organization'
    if (type !== "Person" && type !== "Organization") {
      alert('Type must be either "Person" or "Organization".')
      setIsSubmitting(false)
      return
    }

    const formData = new FormData()
    formData.append("title", title)
    formData.append("type", type)
    formData.append("nationality", nationality)
    formData.append("ethnicity", ethnicity)
    formData.append("migration_year", migration_year.toString())
    formData.append("end_year", end_year.toString())
    formData.append("latitude", latitude.toString())
    formData.append("longitude", longitude.toString())
    formData.append("connections", JSON.stringify(connections || []))
    formData.append("edge", JSON.stringify(edge || []))
    formData.append("user_id", user_id.toString())
    formData.append("migration_traces", JSON.stringify(migration_traces || []))
    if (photo) {
      formData.append("photo", photo)
    }
    // FormData 내용 콘솔에 출력
    for (let [key, value] of formData.entries()) {
    }
    try {
      if (id === 0) {
        await createNetworkMutation.mutateAsync(formData)
        toast.success("Network created successfully!")
      } else {
        await updateNetworkMutation.mutateAsync({ ...editedNetwork, formData })
        toast.success("Network updated successfully!")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateNetwork({ ...editedNetwork, photo: file })
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoRemove = () => {
    updateNetwork({ ...editedNetwork, photo: undefined })
  }

  const handleImportCSV = () => {
    alert(t("This feature is still under development."))
    return
    // fileInputRef.current?.click()
  }

  const processFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n")

      const importedData = lines.slice(1).map((line, index) => {
        const [
          id,
          user_id,
          title,
          type,
          nationality,
          ethnicity,
          migration_year,
          end_year,
          latitude,
          longitude,
          connectionsString,
        ] = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/) // CSV 쉼표 구분

        let connections: any = []

        try {
          if (connectionsString) {
            // CSV의 큰따옴표 제거 후 JSON 파싱
            const parsedConnections = JSON.parse(
              connectionsString.replace(/^"|"$/g, "").replace(/""/g, '"'),
            )

            if (Array.isArray(parsedConnections)) {
              connections = parsedConnections.map((conn: any) => ({
                targetId: Number(conn.targetId),
                targetType: conn.targetType,
                strength: Number(conn.strength),
                type: conn.type,
                year: Number(conn.year),
              }))
            } else {
              throw new Error("Parsed connections data is not an array")
            }
          }
        } catch (error) {
          console.error(
            `Error parsing connection data for line ${index + 1}:`,
            connectionsString,
            error,
          )
        }

        return {
          id: parseInt(id, 10),
          user_id: Number(user_id),
          title,
          type,
          nationality,
          ethnicity,
          migration_year: Number(migration_year),
          end_year: Number(end_year),
          latitude: Number(latitude),
          longitude: Number(longitude),
          connections,
        }
      })

      importedData.forEach((network) => {
        createNetworkMutation.mutate(network)
      })
    }

    reader.readAsText(file)
  }

  const handleExportXLSX = async () => {
    if (!data) return

    const networksSheet = [
      [
        "ID",
        "User ID",
        "Title",
        "Type",
        "Nationality",
        "Ethnicity",
        "Start Year",
        "End Year",
        "Latitude",
        "Longitude",
      ],
      ...data.map(
        ({
          id,
          user_id,
          title,
          type,
          nationality,
          ethnicity,
          migration_year,
          end_year,
          latitude,
          longitude,
        }) => {
          return [
            id,
            user_id,
            title,
            type,
            nationality,
            ethnicity,
            migration_year,
            end_year,
            latitude,
            longitude,
          ]
        },
      ),
    ]

    const edgesSheet = [
      [
        "ID",
        "Network ID",
        "Target ID",
        "Target Type",
        "Strength",
        "Edge Type",
        "Year",
      ],
      ...data.flatMap((network) => {
        return (network.edges || []).map((edge) => [
          edge.id,
          network.id,
          edge.targetId,
          edge.targetType,
          edge.strength,
          edge.edgeType,
          edge.year,
        ])
      }),
    ]

    const migrationTracesSheet = [
      [
        "ID",
        "Network ID",
        "Location Name",
        "Latitude",
        "Longitude",
        "Year",
        "Reason",
      ],
      ...data.flatMap((network) => {
        return (network.migration_traces || []).map((trace) => [
          trace.id,
          network.id,
          trace.location_name,
          trace.latitude,
          trace.longitude,
          trace.migration_year,
          trace.reason,
        ])
      }),
    ]

    // Fetch all comments
    let comments: any[] = []
    try {
      comments = await fetchAllComments()
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    }
    const commentsSheet = [
      [
        "ID",
        "Network ID",
        "User ID",
        "User Name",
        "User Role",
        "Comment",
        "Created At",
      ],
      ...comments.map((comment) => [
        comment.id,
        comment.network_id,
        comment.user_id,
        comment.user_name,
        comment.user_role,
        comment.content,
        comment.created_at
          ? new Date(comment.created_at).toISOString().slice(0, 10)
          : "", // 연-월-일만
      ]),
    ]
    const workbook = XLSX.utils.book_new()
    const networksWS = XLSX.utils.aoa_to_sheet(networksSheet)
    const edgesWS = XLSX.utils.aoa_to_sheet(edgesSheet)
    const migrationTracesWS = XLSX.utils.aoa_to_sheet(migrationTracesSheet)
    const commentsWS = XLSX.utils.aoa_to_sheet(commentsSheet)

    XLSX.utils.book_append_sheet(workbook, networksWS, "Networks")
    XLSX.utils.book_append_sheet(workbook, edgesWS, "Edges")
    XLSX.utils.book_append_sheet(
      workbook,
      migrationTracesWS,
      "Migration Traces",
    )
    XLSX.utils.book_append_sheet(workbook, commentsWS, "Comments")

    XLSX.writeFile(workbook, "networks.xlsx")
  }

  const deleteMigrationTrace = (idx: number) => {
    updateNetwork({
      ...editedNetwork,
      migration_traces: editedNetwork.migration_traces?.filter(
        (_, i) => i !== idx,
      ),
    })
  }

  const deleteConnection = (idx: number) => {
    updateNetwork({
      ...editedNetwork,
      connections: editedNetwork.connections?.filter((_, i) => i !== idx),
    })
  }

  const deleteEdge = (idx: number) => {
    updateNetwork({
      ...editedNetwork,
      edge: editedNetwork.edge?.filter((_, i) => i !== idx),
    })
  }

  const clearFormHandler = () => {
    updateNetwork({
      id: 0,
      title: "",
      type: "Person",
      nationality: "",
      ethnicity: "",
      migration_year: 0,
      end_year: 0,
      latitude: 0,
      longitude: 0,
      migration_traces: [],
      connections: [],
      edge: [],
      user_id: 0,
    })
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleSearchClick = () => {
    if (searchQuery.trim() !== "") {
      setTriggerSearch(true)
    }
  }

  return (
    <div className="flex justify-center items-center flex-col text-gray-600 font-mono bg-[#d1c6b1]">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="flex items-center my-5">
        <GlobeIcon className="h-7 w-7 mr-3 text-amber-900" />
        <span className="text-center text-xl font-extrabold">
          {t("Network Manager")}
        </span>
      </div>

      {/* Search */}
      <div className="w-full max-w-sm p-3 rounded bg-[#d1c6b1] flex gap-4 items-center">
        <input
          type="text"
          placeholder={t("Search Networks")}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchClick()
            }
          }}
          className="w-full max-w-lg p-2 border rounded text-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          onClick={handleSearchClick}
          className="px-4 py-1 bg-amber-600
 text-white rounded hover:bg-amber-800
 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m1.94-7.15a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
            />
          </svg>
        </button>
      </div>

      {/* Render the SearchResults with pagination only after the search button is clicked */}
      {triggerSearch && searchQuery && (
        <SearchResults searchQuery={searchQuery} />
      )}

      <div className="w-full max-w-lg bg-[#f2f2f2] rounded-lg shadow-md p-6">
        <form onSubmit={submitNetworkHandler} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold text-xs">
              {t("Name")}
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder={t("Enter Name")}
              type="text"
              onChange={(e) =>
                updateNetwork({ ...editedNetwork, title: e.target.value })
              }
              value={editedNetwork.title || ""}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold text-xs">
              {t("Photo")}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {editedNetwork.photo && (
              <div className="mt-2">
                <img
                  src={editedNetwork.photo}
                  alt="Network"
                  className="w-full h-auto rounded"
                />
                <button
                  type="button"
                  onClick={handlePhotoRemove}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                >
                  X
                </button>
              </div>
            )}
          </div>
          {/* Type, Nationality, and Ethnicity in a single row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold text-xs mb-1">
                {t("Type")}
              </label>
              <select
                className="text-xs w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                onChange={(e) =>
                  updateNetwork({ ...editedNetwork, type: e.target.value })
                }
                value={editedNetwork.type || "Person"}
              >
                <option value="Person">Person</option>
                <option value="Organization">Organization</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold text-xs mb-1">
                {t("Nationality")}
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="ex) U.S.A"
                type="text"
                onChange={(e) =>
                  updateNetwork({
                    ...editedNetwork,
                    nationality: e.target.value,
                  })
                }
                value={editedNetwork.nationality || ""}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold text-xs mb-1">
                {t("Ethnicity")}
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="ex) Korean"
                type="text"
                onChange={(e) =>
                  updateNetwork({ ...editedNetwork, ethnicity: e.target.value })
                }
                value={editedNetwork.ethnicity || ""}
              />
            </div>
          </div>

          {/* Birth/Death, Latitude, and Longitude in a single row */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {/* Birth or Established */}
            {!isBirthComplete && (
              <div>
                <label className="block text-gray-700 font-semibold text-xs mb-1">
                  {editedNetwork.type === "Person"
                    ? t("Birth")
                    : t("Established")}
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={
                    editedNetwork.type === "Person" ? "ex) 1990" : "ex) 2000"
                  }
                  type="number"
                  onChange={(e) =>
                    updateNetwork({
                      ...editedNetwork,
                      migration_year: Number(e.target.value),
                    })
                  }
                  value={editedNetwork.migration_year || ""}
                  onBlur={() => setIsBirthComplete(true)} // 포커스 아웃 시 Death로 전환
                />
              </div>
            )}

            {/* Death or Dissolved */}
            {isBirthComplete && (
              <div>
                <label className="block text-gray-700 font-semibold text-xs mb-1">
                  {editedNetwork.type === "Person"
                    ? t("Death")
                    : t("Dissolved")}
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={
                    editedNetwork.type === "Person" ? "ex) 1990" : "ex) 2000"
                  }
                  type="number"
                  onChange={(e) =>
                    updateNetwork({
                      ...editedNetwork,
                      end_year: Number(e.target.value),
                    })
                  }
                  value={editedNetwork.end_year || ""}
                  onBlur={() => setIsBirthComplete(false)} // 포커스 아웃 시 Death로 전환
                />
              </div>
            )}
            <div>
              <label className="block text-gray-700 font-semibold text-xs mb-1">
                {t("Latitude")}
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="ex) 43.587"
                type="number"
                onChange={(e) =>
                  updateNetwork({
                    ...editedNetwork,
                    latitude: Number(e.target.value),
                  })
                }
                value={editedNetwork.latitude || ""}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold text-xs mb-1">
                {t("Longitude")}
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="ex) 123.587"
                type="number"
                onChange={(e) =>
                  updateNetwork({
                    ...editedNetwork,
                    longitude: Number(e.target.value),
                  })
                }
                value={editedNetwork.longitude || ""}
              />
            </div>
          </div>
          {/* Migration Trace Section */}
          <div>
            <label className="block text-gray-700 font-semibold text-xs mb-2">
              {t("Migration Trace")}
            </label>
            <div className="space-y-2">
              {editedNetwork.migration_traces?.map((detail, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-1 items-center">
                  {/* Location Name */}
                  <input
                    type="text"
                    className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                    value={detail.location_name || ""}
                    onChange={(e) =>
                      updateNetwork({
                        ...editedNetwork,
                        migration_traces: editedNetwork.migration_traces?.map(
                          (d, i) =>
                            i === idx
                              ? { ...d, location_name: e.target.value }
                              : d,
                        ),
                      })
                    }
                    placeholder={t("Loc.")}
                  />

                  {/* Latitude */}
                  {!isLatitudeComplete ? (
                    <input
                      type="number"
                      className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                      value={detail.latitude || ""}
                      onChange={(e) =>
                        updateNetwork({
                          ...editedNetwork,
                          migration_traces: editedNetwork.migration_traces?.map(
                            (d, i) =>
                              i === idx
                                ? { ...d, latitude: Number(e.target.value) }
                                : d,
                          ),
                        })
                      }
                      placeholder={t("Lat.")}
                      onBlur={() => setIsLatitudeComplete(true)} // 포커스 아웃 시 Longitude로 전환
                    />
                  ) : (
                    <input
                      type="number"
                      className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                      value={detail.longitude || ""}
                      onChange={(e) =>
                        updateNetwork({
                          ...editedNetwork,
                          migration_traces: editedNetwork.migration_traces?.map(
                            (d, i) =>
                              i === idx
                                ? { ...d, longitude: Number(e.target.value) }
                                : d,
                          ),
                        })
                      }
                      placeholder={t("Long.")}
                      onBlur={() => setIsLatitudeComplete(false)} // 포커스 아웃 시 Latitude로 전환
                    />
                  )}

                  {/* Year */}
                  <input
                    type="number"
                    className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                    value={detail.migration_year || ""}
                    onChange={(e) =>
                      updateNetwork({
                        ...editedNetwork,
                        migration_traces: editedNetwork.migration_traces?.map(
                          (d, i) =>
                            i === idx
                              ? { ...d, migration_year: Number(e.target.value) }
                              : d,
                        ),
                      })
                    }
                    placeholder={t("Year")}
                  />

                  {/* Reason */}
                  <input
                    type="text"
                    className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                    value={detail.reason || ""}
                    onChange={(e) =>
                      updateNetwork({
                        ...editedNetwork,
                        migration_traces: editedNetwork.migration_traces?.map(
                          (d, i) =>
                            i === idx ? { ...d, reason: e.target.value } : d,
                        ),
                      })
                    }
                    placeholder={t("Reason")}
                  />

                  {/* Delete Button */}
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 flex justify-center items-center"
                    onClick={() =>
                      updateNetwork({
                        ...editedNetwork,
                        migration_traces:
                          editedNetwork.migration_traces?.filter(
                            (_, i) => i !== idx,
                          ),
                      })
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add New Detail */}
              <button
                type="button"
                className="block mx-auto mt-2 w-auto px-3 py-1 bg-[#d1c6b1] text-[#3e2723] border border-[#9e9d89] rounded-lg hover:bg-[#c4b8a6] hover:text-[#5d4037] transition-all duration-200"
                onClick={() =>
                  updateNetwork({
                    ...editedNetwork,
                    migration_traces: [
                      ...(editedNetwork.migration_traces || []),
                      {
                        location_name: "",
                        latitude: 0,
                        longitude: 0,
                        migration_year: 0,
                        reason: "",
                      },
                    ],
                  })
                }
              >
                {t("Add")}
              </button>
            </div>
          </div>
          <div>
            {/* Edge Section */}
            <div>
              <label className="block text-gray-700 font-semibold text-xs mb-2">
                {t("Edge Section")}
              </label>
              <div className="space-y-2">
                {editedNetwork.edge?.map((edge, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-5 gap-1 items-center"
                  >
                    {/* Target ID */}
                    {!isTargetIdComplete ? (
                      <input
                        type="number"
                        className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                        value={edge.targetId || ""}
                        onChange={(e) =>
                          updateNetwork({
                            ...editedNetwork,
                            edge: editedNetwork.edge?.map((d, i) =>
                              i === idx
                                ? { ...d, targetId: Number(e.target.value) }
                                : d,
                            ),
                          })
                        }
                        placeholder="ID"
                        onBlur={() => setIsTargetIdComplete(true)} // 포커스 아웃 시 Target Type으로 전환
                      />
                    ) : (
                      <select
                        className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                        value={edge.targetType || "Person"}
                        onChange={(e) =>
                          updateNetwork({
                            ...editedNetwork,
                            edge: editedNetwork.edge?.map((d, i) =>
                              i === idx
                                ? { ...d, targetType: e.target.value }
                                : d,
                            ),
                          })
                        }
                        onBlur={() => setIsTargetIdComplete(false)} // 포커스 아웃 시 Target ID로 전환
                      >
                        <option value="Person">Person</option>
                        <option value="Organization">Organization</option>
                      </select>
                    )}

                    {/* Strength */}
                    <input
                      type="number"
                      className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                      value={edge.strength || ""}
                      onChange={(e) =>
                        updateNetwork({
                          ...editedNetwork,
                          edge: editedNetwork.edge?.map((d, i) =>
                            i === idx
                              ? { ...d, strength: Number(e.target.value) }
                              : d,
                          ),
                        })
                      }
                      placeholder={t("Str.")}
                    />

                    {/* Edge Type */}
                    <input
                      type="text"
                      className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                      value={edge.edgeType || ""}
                      onChange={(e) =>
                        updateNetwork({
                          ...editedNetwork,
                          edge: editedNetwork.edge?.map((d, i) =>
                            i === idx ? { ...d, edgeType: e.target.value } : d,
                          ),
                        })
                      }
                      placeholder={t("Type")}
                    />

                    {/* Year */}
                    <input
                      type="number"
                      className="w-full px-1 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                      value={edge.year || ""}
                      onChange={(e) =>
                        updateNetwork({
                          ...editedNetwork,
                          edge: editedNetwork.edge?.map((d, i) =>
                            i === idx
                              ? { ...d, year: Number(e.target.value) }
                              : d,
                          ),
                        })
                      }
                      placeholder={t("Year")}
                    />

                    {/* Delete Button */}
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 flex justify-center items-center"
                      onClick={() =>
                        updateNetwork({
                          ...editedNetwork,
                          edge: editedNetwork.edge?.filter((_, i) => i !== idx),
                        })
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Add New Edge */}
                <button
                  type="button"
                  className="block mx-auto mt-2 w-auto px-3 py-1 bg-[#d1c6b1] text-[#3e2723] border border-[#9e9d89] rounded-lg hover:bg-[#c4b8a6] hover:text-[#5d4037] transition-all duration-200"
                  onClick={() =>
                    updateNetwork({
                      ...editedNetwork,
                      edge: [
                        ...(editedNetwork.edge || []),
                        {
                          targetId: 0,
                          targetType: "Person",
                          strength: 0,
                          edgeType: "",
                          year: 0,
                        },
                      ],
                    })
                  }
                >
                  {t("Add")}
                </button>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={clearFormHandler}
                className="w-full py-2 bg-[#800020] text-gray-100 rounded-lg hover:bg-[#455a64] focus:outline-none mr-3"
              >
                {t("Clear")}
              </button>
              <button
                className="w-full py-2 bg-[#800020] text-gray-100 rounded-lg hover:bg-[#455a64] disabled:opacity-40 focus:outline-none mr-3"
                disabled={
                  !editedNetwork.title ||
                  !editedNetwork.nationality ||
                  !editedNetwork.ethnicity ||
                  !editedNetwork.migration_year ||
                  !editedNetwork.latitude ||
                  !editedNetwork.longitude ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <ClipLoader size={50} color={"#fff"} />
                ) : editedNetwork.id === 0 ? (
                  t("Create")
                ) : (
                  t("Update")
                )}
              </button>
            </div>
          </div>
        </form>
        <style>
          {`
          @media (max-width: 390px) {
            .w-full {
              max-width: 95%;
              padding: 10px;
            }
            input, button {
              font-size: 0.6rem;
              padding: 6px;
            }
            input::placeholder {
              font-size: 0.5rem; /* 플레이스홀더 글자 크기 조정 */
              color: #9ca3af; /* 플레이스홀더 색상 (회색) */
            }
            label {
              font-size: 0.7rem; /* 라벨 글자 크기 축소 */
            }
              
          }
        `}
        </style>
      </div>

      <div className="flex justify-center gap-2 my-4">
        <button
          onClick={handleImportCSV}
          className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {t("Import")}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) processFile(file)
          }}
        />
        <button
          onClick={handleExportXLSX}
          className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {t("Export")}
        </button>
      </div>
    </div>
  )
}
