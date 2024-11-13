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
    <li className="my-3 p-4 bg-white rounded shadow-md text-sm">
      <div className="flex justify-between items-center">
        <span className="font-bold text-base">
          No.{id} : {title}
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
              <th className="px-2 py-1 border font-semibold text-center">
                Type
              </th>
              <th className="px-2 py-1 border font-semibold text-center">
                Nationality
              </th>
              <th className="px-2 py-1 border font-semibold text-center">
                Ethnicity
              </th>
              <th className="px-2 py-1 border font-semibold text-center">
                Latitude
              </th>
              <th className="px-2 py-1 border font-semibold text-center">
                Longitude
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-1 border text-center">{type}</td>
              <td className="px-2 py-1 border text-center">{nationality}</td>
              <td className="px-2 py-1 border text-center">{ethnicity}</td>
              <td className="px-2 py-1 border text-center">{latitude}</td>
              <td className="px-2 py-1 border text-center">{longitude}</td>
            </tr>
          </tbody>
        </table>

        {/* Render the connections */}
        <div className="mt-4">
          <strong>Connections:</strong>
          {connections.length > 0 ? (
            <div className="mt-2">
              {connections.map((connection, index) => (
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
                      </tr>
                    </tbody>
                  </table>

                  {/* Add a separator between connections */}
                  {index < connections.length - 1 && (
                    <div className="border-t my-2"></div> // Divider between connections
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
