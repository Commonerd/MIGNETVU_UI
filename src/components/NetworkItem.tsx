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
      </div>
    </li>
  )
}

export const NetworkItem = memo(NetworkItemMemo)
