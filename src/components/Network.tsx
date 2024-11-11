import { FormEvent } from 'react'
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
  const queryClient = useQueryClient()
  const { editedNetwork } = useStore()
  const updateNetwork = useStore((state) => state.updateEditedNetwork)
  const { data, isLoading } = useQueryNetworks()
  const { createNetworkMutation, updateNetworkMutation } = useMutateNetwork()
  const { logoutMutation } = useMutateAuth()

  const submitNetworkHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editedNetwork.id === 0) {
      createNetworkMutation.mutate({
        title: editedNetwork.title,
        type: editedNetwork.type,
        nationality: editedNetwork.nationality,
      })
    } else {
      updateNetworkMutation.mutate(editedNetwork)
    }
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
    queryClient.removeQueries(['networks'])
  }

  return (
    <div className="flex justify-center items-center flex-col text-gray-600 font-mono bg-gray-100">
      <div className="flex items-center my-6">
        <ShieldCheckIcon className="h-8 w-8 mr-3 text-indigo-500 cursor-pointer" />
        <span className="text-center text-3xl font-extrabold">
          Network Manager
        </span>
      </div>
      <ArrowRightOnRectangleIcon
        onClick={logout}
        className="h-6 w-6 my-6 text-blue-500 cursor-pointer"
      />

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

          <button
            className="w-full py-2 text-white bg-indigo-600 rounded disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={
              !editedNetwork.title ||
              !editedNetwork.type ||
              !editedNetwork.nationality ||
              !editedNetwork.ethnicity
            }
          >
            {editedNetwork.id === 0 ? 'Create' : 'Update'}
          </button>
        </form>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="my-5 w-full max-w-md">
          {data?.map((network) => (
            <NetworkItem
              key={network.id}
              id={network.id}
              title={network.title}
              type={network.type}
              nationality={network.nationality}
              ethnicity={network.ethnicity}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
