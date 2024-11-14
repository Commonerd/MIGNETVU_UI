import { FormEvent, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid'
import useStore from '../store'
import { useQueryNetworks } from '../hooks/useQueryNetworks'
import { useMutateNetwork } from '../hooks/useMutateNetwork'
import { useMutateAuth } from '../hooks/useMutateAuth'
import { NetworkItem } from './NetworkItem'

export const Network = () => {
  const { editedNetwork } = useStore()
  const updateNetwork = useStore((state) => state.updateEditedNetwork)
  const { data, isLoading } = useQueryNetworks()
  const { createNetworkMutation, updateNetworkMutation } = useMutateNetwork()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const submitNetworkHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const {
      id,
      title,
      type,
      nationality,
      ethnicity,
      migration_year,
      latitude,
      longitude,
      connections,
      user_id,
    } = editedNetwork

    // Ensure type is either 'Migrant' or 'Organization'
    if (type !== 'Migrant' && type !== 'Organization') {
      alert('Type must be either "Migrant" or "Organization".')
      return
    }

    // Ensure that connections is an empty array if it's undefined
    const networkData = {
      title,
      type,
      nationality,
      ethnicity,
      migration_year: Number(migration_year),
      latitude: Number(latitude),
      longitude: Number(longitude),
      connections: connections || [], // Default to an empty array if no connections
      user_id,
    }

    if (id === 0) {
      createNetworkMutation.mutate({
        title,
        type,
        nationality,
        ethnicity,
        migration_year: Number(migration_year),
        latitude: Number(latitude),
        longitude: Number(longitude),
        connections: connections || [],
        user_id: Number(user_id),
      })
    } else {
      updateNetworkMutation.mutate({
        ...editedNetwork,
        migration_year: Number(migration_year),
        latitude: Number(latitude),
        longitude: Number(longitude),
        connections: connections || [],
      })
    }
  }

  const handleImportCSV = () => {
    fileInputRef.current?.click()
  }

  const processFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const importedData = lines.slice(1).map((line) => {
        const [
          id,
          user_id,
          title,
          type,
          nationality,
          ethnicity,
          migartion_year,
          latitude,
          longitude,
          connectionsString,
        ] = line.split(',')

        // Handle connectionsString: Try to parse the string as a JSON array
        let connections: Array<{
          targetId: number
          targetType: string
          strength: number
          type: string
        }> = []
        try {
          if (connectionsString) {
            // Remove any surrounding whitespace (e.g., extra spaces or newlines)
            const cleanedConnectionsString = connectionsString.trim()

            // Try to parse it directly as a JSON array
            connections = JSON.parse(cleanedConnectionsString)

            // Optionally validate each object in the array if necessary
            connections = connections.map((conn: any) => ({
              targetId: conn.targetId || 0,
              targetType: conn.targetType || '',
              strength: conn.strength || 0,
              type: conn.type || '',
            }))
          }
        } catch (error) {
          console.error(
            'Error parsing connection data:',
            connectionsString,
            error,
          )
        }

        return {
          id: parseInt(id, 10),
          user_id,
          title,
          type,
          nationality,
          ethnicity,
          migration_year: Number(migartion_year),
          latitude: Number(latitude),
          longitude: Number(longitude),
          connections, // The processed connections array
        }
      })

      // Import each network entry
      importedData.forEach((network) => createNetworkMutation.mutate(network))
    }
    reader.readAsText(file)
  }

  const handleExportCSV = () => {
    if (!data) return

    // CSV 헤더 정의
    const csvRows = [
      [
        'ID',
        'Title',
        'Type',
        'Nationality',
        'Ethnicity',
        'Latitude',
        'Longitude',
        'Connections', // Connections 컬럼
      ],
      ...data.map(
        ({
          id,
          title,
          type,
          nationality,
          ethnicity,
          latitude,
          longitude,
          connections,
        }) => {
          // connections 배열을 쉼표로 구분된 문자열로 변환
          const connectionsString = connections
            ? connections.map((conn) => JSON.stringify(conn)).join('; ') // 각 커넥션 항목을 JSON 형식으로 변환하고 세미콜론으로 구분
            : ''

          return [
            id,
            title,
            type,
            nationality,
            ethnicity,
            latitude,
            longitude,
            `"${connectionsString}"`, // CSV에서 쉼표가 포함될 수 있으므로 따옴표로 감쌈
          ].join(',') // 열 구분자로 쉼표 사용
        },
      ),
    ]

    // CSV 내용 생성
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n')

    // CSV 파일 다운로드 링크 생성
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'networks.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deleteConnection = (idx: number) => {
    updateNetwork({
      ...editedNetwork,
      connections: editedNetwork.connections?.filter((_, i) => i !== idx),
    })
  }

  return (
    <div className="flex justify-center items-center flex-col text-gray-600 font-mono bg-gray-100">
      <div className="flex items-center my-6">
        <ShieldCheckIcon className="h-8 w-8 mr-3 text-indigo-500 cursor-pointer" />
        <span className="text-center text-3xl font-extrabold">
          Network Manager
        </span>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <form onSubmit={submitNetworkHandler} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Name</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter name"
              type="text"
              onChange={(e) =>
                updateNetwork({ ...editedNetwork, title: e.target.value })
              }
              value={editedNetwork.title || ''}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Type</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) =>
                updateNetwork({ ...editedNetwork, type: e.target.value })
              }
              value={editedNetwork.type || ''}
            >
              <option value="">Select Type</option>
              <option value="Migrant">Migrant</option>
              <option value="Organization">Organization</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              Nationality
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter nationality"
              type="text"
              onChange={(e) =>
                updateNetwork({ ...editedNetwork, nationality: e.target.value })
              }
              value={editedNetwork.nationality || ''}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Ethnicity</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter ethnicity"
              type="text"
              onChange={(e) =>
                updateNetwork({ ...editedNetwork, ethnicity: e.target.value })
              }
              value={editedNetwork.ethnicity || ''}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              Migration Year
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter migration year"
              type="number"
              onChange={(e) =>
                updateNetwork({
                  ...editedNetwork,
                  migration_year: Number(e.target.value),
                })
              }
              value={editedNetwork.migration_year || ''}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Latitude</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter latitude"
              type="number"
              onChange={(e) =>
                updateNetwork({
                  ...editedNetwork,
                  latitude: Number(e.target.value),
                })
              }
              value={editedNetwork.latitude || ''}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Longitude</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter longitude"
              type="number"
              onChange={(e) =>
                updateNetwork({
                  ...editedNetwork,
                  longitude: Number(e.target.value),
                })
              }
              value={editedNetwork.longitude || ''}
            />
          </div>
          {/* Connections section */}
          <div>
            <label className="block text-gray-700 font-medium">
              Connections
            </label>
            <div className="space-y-3">
              {editedNetwork.connections?.map((conn, idx) => (
                <div key={idx}>
                  {idx > 0 && <hr className="my-4 border-gray-300" />}{' '}
                  <div className="flex justify-between space-x-2">
                    {' '}
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-xs"
                      value={conn.targetId || ''}
                      onChange={(e) =>
                        updateNetwork({
                          ...editedNetwork,
                          connections: editedNetwork.connections?.map((c, i) =>
                            i === idx
                              ? { ...c, targetId: Number(e.target.value) }
                              : c,
                          ),
                        })
                      }
                      placeholder="Target ID"
                    />
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-xs"
                      value={conn.targetType || ''}
                      onChange={(e) =>
                        updateNetwork({
                          ...editedNetwork,
                          connections: editedNetwork.connections?.map((c, i) =>
                            i === idx
                              ? { ...c, targetType: e.target.value }
                              : c,
                          ),
                        })
                      }
                    >
                      <option value="">Select Type</option>
                      <option value="Migrant">Migrant</option>
                      <option value="Organization">Organization</option>
                    </select>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-xs"
                      value={conn.strength || ''}
                      onChange={(e) =>
                        updateNetwork({
                          ...editedNetwork,
                          connections: editedNetwork.connections?.map((c, i) =>
                            i === idx
                              ? { ...c, strength: Number(e.target.value) }
                              : c,
                          ),
                        })
                      }
                      placeholder="Strength"
                    />
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-xs"
                      value={conn.type || ''}
                      onChange={(e) =>
                        updateNetwork({
                          ...editedNetwork,
                          connections: editedNetwork.connections?.map((c, i) =>
                            i === idx ? { ...c, type: e.target.value } : c,
                          ),
                        })
                      }
                      placeholder="Edge Type"
                    />
                    <button
                      type="button"
                      className="px-4 py-2 text-red-500 text-sm"
                      onClick={() => deleteConnection(idx)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="w-full py-2 px-4 bg-indigo-500 text-white rounded mt-3"
                onClick={() =>
                  updateNetwork({
                    ...editedNetwork,
                    connections: [
                      ...(editedNetwork.connections || []),
                      {
                        targetId: 0,
                        targetType: '',
                        strength: 0,
                        type: '',
                      },
                    ],
                  })
                }
              >
                Add Connection
              </button>
            </div>
          </div>

          <button
            className="w-full py-2 text-white bg-indigo-500 hover:bg-indigo-700 rounded disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={
              !editedNetwork.title ||
              !editedNetwork.type ||
              !editedNetwork.nationality ||
              !editedNetwork.ethnicity ||
              !editedNetwork.migration_year ||
              !editedNetwork.latitude ||
              !editedNetwork.longitude
            }
          >
            {editedNetwork.id === 0 ? 'Create' : 'Update'}
          </button>
        </form>
      </div>

      <div className="flex justify-center gap-2 my-4">
        <button
          onClick={handleImportCSV}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Import
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) processFile(file)
          }}
        />
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
        >
          Export
        </button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="my-0 w-full max-w-md">
          {data?.map((network) => (
            <NetworkItem
              key={network.id}
              id={network.id}
              title={network.title}
              type={network.type}
              nationality={network.nationality}
              ethnicity={network.ethnicity}
              migration_year={network.migration_year}
              latitude={network.latitude}
              longitude={network.longitude}
              connections={network.connections}
              user_id={0}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
