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
  // const queryClient = useQueryClient()
  const { editedNetwork } = useStore()
  const updateNetwork = useStore((state) => state.updateEditedNetwork)
  const { data, isLoading } = useQueryNetworks()
  const { createNetworkMutation, updateNetworkMutation } = useMutateNetwork()
  // const { logoutMutation } = useMutateAuth()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const submitNetworkHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editedNetwork.id === 0) {
      createNetworkMutation.mutate({
        title: editedNetwork.title,
        type: editedNetwork.type,
        nationality: editedNetwork.nationality,
        ethnicity: editedNetwork.ethnicity,
        latitude: Number(editedNetwork.latitude),
        longitude: Number(editedNetwork.longitude),
      })
    } else {
      updateNetworkMutation.mutate({
        ...editedNetwork,
        latitude: Number(editedNetwork.latitude),
        longitude: Number(editedNetwork.longitude),
      })
    }
  }

  // Handler for importing CSV data
  const handleImportCSV = () => {
    fileInputRef.current?.click()
  }

  // Process imported CSV file
  const processFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const importedData = lines.slice(1).map((line) => {
        const [id, title, type, nationality, ethnicity, latitude, longitude] =
          line.split(',')
        return {
          id: parseInt(id),
          title,
          type,
          nationality,
          ethnicity,
          latitude: Number(latitude),
          longitude: Number(longitude),
        }
      })
      importedData.forEach((network) => createNetworkMutation.mutate(network))
    }
    reader.readAsText(file)
  }

  // Handler for exporting current data to CSV
  const handleExportCSV = () => {
    if (!data) return
    const csvRows = [
      [
        'ID',
        'Title',
        'Type',
        'Nationality',
        'Ethnicity',
        'Latitude',
        'Longitude',
      ],
      ...data.map(
        ({ id, title, type, nationality, ethnicity, latitude, longitude }) =>
          [id, title, type, nationality, ethnicity, latitude, longitude].join(
            ',',
          ),
      ),
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'networks.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter type"
              type="text"
              onChange={(e) =>
                updateNetwork({ ...editedNetwork, type: e.target.value })
              }
              value={editedNetwork.type || ''}
            />
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
          <button
            className="w-full py-2 text-white bg-indigo-500 hover:bg-indigo-700 rounded disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={
              !editedNetwork.title ||
              !editedNetwork.type ||
              !editedNetwork.nationality ||
              !editedNetwork.ethnicity ||
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
          className="px-20 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
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
          className="px-20 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
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
              latitude={network.latitude}
              longitude={network.longitude}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
