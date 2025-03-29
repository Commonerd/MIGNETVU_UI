import { FormEvent, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid"
import useStore from "../store"
import { useQueryNetworks } from "../hooks/useQueryNetworks"
import { useMutateNetwork } from "../hooks/useMutateNetwork"
import SearchResults from "./SearchResults"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { GlobeIcon } from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ClipLoader } from "react-spinners"
import * as XLSX from "xlsx"
import { fetchAllComments } from "../api/comments"

export const Network = () => {
  const { t } = useTranslation()
  const { editedNetwork } = useStore()
  const updateNetwork = useStore((state) => state.updateEditedNetwork)
  const { data } = useQueryNetworks()
  const { createNetworkMutation, updateNetworkMutation } = useMutateNetwork()
  const [searchQuery, setSearchQuery] = useState("")
  const [triggerSearch, setTriggerSearch] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

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

    // Ensure type is either 'Migrant' or 'Organization'
    if (type !== "Migrant" && type !== "Organization") {
      alert('Type must be either "Migrant" or "Organization".')
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
    console.log(formData)
    // FormData 내용 콘솔에 출력
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
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

        console.log(
          `Line ${index + 1} original connectionsString:`,
          connectionsString,
        )

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

      console.log("Final imported data:", importedData)

      importedData.forEach((network) => {
        console.log("Sending network to mutation:", network)
        createNetworkMutation.mutate(network)
      })
    }

    reader.readAsText(file)
  }

  const handleExportXLSX = async () => {
    if (!data) return

    console.log("Data:", data)

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
        console.log("Network Edges:", network.edges)
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
        console.log("Network Migration Traces:", network.migration_traces)
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
        comment.created_at,
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
      type: "Migrant",
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
          Network Manager
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
            <label className="block text-gray-700 font-semibold text-sm">
              Name
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter name"
              type="text"
              onChange={(e) =>
                updateNetwork({ ...editedNetwork, title: e.target.value })
              }
              value={editedNetwork.title || ""}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold text-sm">
              Photo
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
                  Remove Photo
                </button>
              </div>
            )}
          </div>
          {/* Type, Nationality, and Ethnicity in a single row */}
          <div className="flex space-x-4">
            <div className="w-1/3">
              <label className="block text-gray-700 font-semibold text-sm">
                Type
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                onChange={(e) =>
                  updateNetwork({ ...editedNetwork, type: e.target.value })
                }
                value={editedNetwork.type || "Migrant"}
              >
                <option value="Migrant">Migrant</option>
                <option value="Organization">Organization</option>
              </select>
            </div>
            <div className="w-1/3">
              <label className="block text-gray-700 font-semibold text-sm">
                Nationality
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
            <div className="w-1/3">
              <label className="block text-gray-700 font-semibold text-sm">
                Ethnicity
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
          {/* Migration Year, Latitude, and Longitude in a single row */}
          <div className="flex space-x-4">
            <div className="w-1/3">
              <label className="block text-gray-700 font-semibold text-sm">
                {editedNetwork.type === "Migrant"
                  ? "Birth Year"
                  : "Established Year"}
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder={
                  editedNetwork.type === "Migrant" ? "ex) 1990" : "ex) 2000"
                }
                type="number"
                onChange={(e) =>
                  updateNetwork({
                    ...editedNetwork,
                    migration_year: Number(e.target.value),
                  })
                }
                value={editedNetwork.migration_year || ""}
              />
              <label className="block text-gray-700 font-semibold text-sm">
                {editedNetwork.type === "Migrant"
                  ? "Death Year"
                  : "Dissolved Year"}
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder={
                  editedNetwork.type === "Migrant" ? "ex) 1990" : "ex) 2000"
                }
                type="number"
                onChange={(e) =>
                  updateNetwork({
                    ...editedNetwork,
                    end_year: Number(e.target.value),
                  })
                }
                value={editedNetwork.end_year || ""}
              />
            </div>
            <div className="w-1/3">
              <label className="block text-gray-700 font-semibold text-sm">
                Latitude
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
            <div className="w-1/3">
              <label className="block text-gray-700 font-semibold text-sm">
                Longitude
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
          {/* Migration Details section */}
          <div>
            <label className="block text-gray-700 font-semibold text-sm mb-2">
              Migration Trace
            </label>
            <div className="space-y-3">
              {editedNetwork.migration_traces?.map((detail, idx) => (
                <div key={idx}>
                  {idx > 0 && <hr className="my-1 border-gray-300" />}
                  <div className="flex justify-between space-x-2">
                    {/* Location Name */}
                    <div className="flex-1">
                      <label className="flex items-center justify-center block text-gray-700 font-semibold text-xs mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-xs"
                        value={detail.location_name || ""}
                        onChange={(e) =>
                          updateNetwork({
                            ...editedNetwork,
                            migration_traces:
                              editedNetwork.migration_traces?.map((d, i) =>
                                i === idx
                                  ? { ...d, location_name: e.target.value }
                                  : d,
                              ),
                          })
                        }
                        placeholder="Seoul"
                      />
                    </div>

                    {/* Latitude */}
                    <div className="flex-1">
                      <label className="flex items-center justify-center block text-gray-700 font-semibold text-xs mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-xs"
                        value={detail.latitude || ""}
                        onChange={(e) =>
                          updateNetwork({
                            ...editedNetwork,
                            migration_traces:
                              editedNetwork.migration_traces?.map((d, i) =>
                                i === idx
                                  ? { ...d, latitude: Number(e.target.value) }
                                  : d,
                              ),
                          })
                        }
                        placeholder="42.385"
                      />
                    </div>

                    {/* Longitude */}
                    <div className="flex-1">
                      <label className="flex items-center justify-center block text-gray-700 font-semibold text-xs mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-xs"
                        value={detail.longitude || ""}
                        onChange={(e) =>
                          updateNetwork({
                            ...editedNetwork,
                            migration_traces:
                              editedNetwork.migration_traces?.map((d, i) =>
                                i === idx
                                  ? { ...d, longitude: Number(e.target.value) }
                                  : d,
                              ),
                          })
                        }
                        placeholder="121.253"
                      />
                    </div>

                    {/* Year */}
                    <div className="flex-1">
                      <label className="flex items-center justify-center block text-gray-700 font-semibold text-xs mb-1">
                        Year
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-xs"
                        value={detail.migration_year || ""}
                        onChange={(e) =>
                          updateNetwork({
                            ...editedNetwork,
                            migration_traces:
                              editedNetwork.migration_traces?.map((d, i) =>
                                i === idx
                                  ? {
                                      ...d,
                                      migration_year: Number(e.target.value),
                                    }
                                  : d,
                              ),
                          })
                        }
                        placeholder="2015"
                      />
                    </div>

                    {/* Reason */}
                    <div className="flex-1">
                      <label className="flex items-center justify-center block text-gray-700 font-semibold text-xs mb-1">
                        Reason
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-xs"
                        value={detail.reason || ""}
                        onChange={(e) =>
                          updateNetwork({
                            ...editedNetwork,
                            migration_traces:
                              editedNetwork.migration_traces?.map((d, i) =>
                                i === idx
                                  ? { ...d, reason: e.target.value }
                                  : d,
                              ),
                          })
                        }
                        placeholder="Job"
                      />
                    </div>
                    {/* Delete Button */}
                    <button
                      type="button"
                      className="flex items-center justify-center px-1 py-1 text-red-500 text-xs font-bold"
                      onClick={() => deleteMigrationTrace(idx)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Detail */}
              <button
                type="button"
                className="mt-3 w-full text-center bg-gray-300 text-gray-800 rounded hover:bg-gray-400 px-4 py-2 rounded"
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
                        // id: 0,
                        // network_id: 0,
                      },
                    ],
                  })
                }
              >
                Add Migration Trace
              </button>
            </div>
          </div>
          <div>
            <div className="space-y-3">
              <label className="block text-gray-700 font-semibold text-sm mb-2">
                Edge section
              </label>
              <div>
                <div className="space-y-3">
                  {editedNetwork.edge?.map((edge, idx) => (
                    <div key={idx}>
                      {idx > 0 && <hr className="my-1 border-gray-300" />}
                      <div className="flex justify-between space-x-2">
                        {/* Target ID */}
                        <div className="flex-1">
                          <label className="flex items-center justify-center block text-gray-700 font-semibold text-xs mb-1">
                            Target ID
                          </label>
                          <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-xs"
                            value={edge.targetId}
                            onChange={(e) =>
                              updateNetwork({
                                ...editedNetwork,
                                edge: editedNetwork.edge?.map((c, i) =>
                                  i === idx
                                    ? { ...c, targetId: Number(e.target.value) }
                                    : c,
                                ),
                              })
                            }
                            placeholder="ID"
                          />
                        </div>

                        {/* Target Type */}
                        <div className="flex-1">
                          <label className="flex items-center justify-center block text-gray-700 font-semibold text-xs mb-1">
                            Target Type
                          </label>
                          <select
                            className="w-full h-10 px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-xs"
                            value={edge.targetType || "Migrant"}
                            onChange={(e) =>
                              updateNetwork({
                                ...editedNetwork,
                                edge: editedNetwork.edge?.map((c, i) =>
                                  i === idx
                                    ? { ...c, targetType: e.target.value }
                                    : c,
                                ),
                              })
                            }
                          >
                            <option value="Migrant" className="text-sm">
                              Migrant
                            </option>
                            <option value="Organization" className="text-sm">
                              Organization
                            </option>
                          </select>
                        </div>

                        {/* Strength */}
                        <div className="flex-1">
                          <label className="flex items-center justify-center block text-gray-700 font-semibold text-xs mb-1">
                            Strength
                          </label>
                          <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-xs"
                            value={edge.strength}
                            onChange={(e) =>
                              updateNetwork({
                                ...editedNetwork,
                                edge: editedNetwork.edge?.map((c, i) =>
                                  i === idx
                                    ? { ...c, strength: Number(e.target.value) }
                                    : c,
                                ),
                              })
                            }
                            placeholder="1~5"
                            min="1"
                            max="5"
                          />
                        </div>

                        {/* Edge Type */}
                        <div className="flex-1">
                          <label className="flex items-center justify-center block text-gray-700 font-semibold text-xs mb-1">
                            Edge Type
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-xs"
                            value={edge.edgeType}
                            onChange={(e) =>
                              updateNetwork({
                                ...editedNetwork,
                                edge: editedNetwork.edge?.map((c, i) =>
                                  i === idx
                                    ? { ...c, edgeType: e.target.value }
                                    : c,
                                ),
                              })
                            }
                            placeholder="family"
                          />
                        </div>

                        {/* Year */}
                        <div className="flex-1">
                          <label className="flex items-center justify-center block text-gray-700 font-semibold text-xs mb-1">
                            Year
                          </label>
                          <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-xs"
                            value={edge.year || ""}
                            onChange={(e) =>
                              updateNetwork({
                                ...editedNetwork,
                                edge: editedNetwork.edge?.map((c, i) =>
                                  i === idx
                                    ? { ...c, year: Number(e.target.value) }
                                    : c,
                                ),
                              })
                            }
                            placeholder="1920"
                          />
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className="flex items-center justify-center px-1 py-1 text-red-500 text-xs font-bold"
                          onClick={() => deleteEdge(idx)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  className="w-full py-2 px-4 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 rounded mt-3"
                  onClick={() => {
                    updateNetwork({
                      ...editedNetwork,
                      edge: [
                        ...(editedNetwork.edge || []),
                        {
                          targetId: 0,
                          targetType: "Migrant",
                          strength: 0,
                          edgeType: "",
                          year: 0,
                        },
                      ],
                    })
                  }}
                >
                  Add Edge
                </button>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={clearFormHandler}
                className="w-full py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none mr-3"
              >
                Clear
              </button>
              <button
                className="w-full py-2 bg-gray-400 text-gray-800 rounded hover:bg-gray-600 rounded disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  "Create"
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex justify-center gap-2 my-4">
        <button
          onClick={handleImportCSV}
          className="px-4 py-2 bg-[#6E7F7A] text-white rounded hover:bg-[#36454F]"
        >
          Import
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
          className="px-4 py-2 bg-[#6E7F7A] text-white rounded hover:bg-[#36454F]"
        >
          Export
        </button>
      </div>
    </div>
  )
}
