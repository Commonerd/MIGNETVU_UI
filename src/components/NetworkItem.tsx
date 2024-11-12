import { FC, memo } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import useStore from '../store'
import { Network } from '../types'
import { useMutateNetwork } from '../hooks/useMutateNetwork'

const NetworkItemMemo: FC<Omit<Network, 'created_at' | 'updated_at'>> = ({
  id,
  title,
  type,
  nationality,
  ethnicity,
  latitude,
  longitude,
  connections,
}) => {
  const updateNetwork = useStore((state) => state.updateEditedNetwork)
  const { deleteNetworkMutation } = useMutateNetwork()

  return (
    <li className="my-3 p-4 bg-white rounded shadow-md">
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">{title}</span>
        <div className="flex ml-4">
          <PencilIcon
            className="h-5 w-5 mx-1 text-blue-500 cursor-pointer"
            onClick={() => {
              updateNetwork({
                id: id,
                title: title,
                type: type,
                nationality: nationality,
                ethnicity: ethnicity,
                latitude: latitude,
                longitude: longitude,
                connections: connections,
              })
              // Scroll to the top
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }}
          />
          <TrashIcon
            className="h-5 w-5 text-red-500 cursor-pointer"
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

      <div className="text-sm text-gray-600 mt-2">
        <p>
          <strong>Type:</strong> {type}
        </p>
        <p>
          <strong>Nationality:</strong> {nationality}
        </p>
        <p>
          <strong>Ethnicity:</strong> {ethnicity}
        </p>
        <p>
          <strong>Latitude:</strong> {latitude}
        </p>
        <p>
          <strong>Longitude:</strong> {longitude}
        </p>

        {/* Render the connections */}
        <div className="mt-4">
          <strong>Connections:</strong>
          <ul className="list-disc ml-4 mt-2">
            {connections.length > 0 ? (
              connections.map((connection) => (
                <li key={connection.targetId}>
                  <p>
                    <strong>Target ID:</strong> {connection.targetId}
                  </p>
                  <p>
                    <strong>Target Type:</strong> {connection.targetType}
                  </p>
                  <p>
                    <strong>Strength:</strong> {connection.strength}
                  </p>
                  <p>
                    <strong>Connection Type:</strong> {connection.type}
                  </p>
                </li>
              ))
            ) : (
              <p>No connections available.</p>
            )}
          </ul>
        </div>
      </div>
    </li>
  )
}

export const NetworkItem = memo(NetworkItemMemo)
