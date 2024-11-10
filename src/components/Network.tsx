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
    if (editedNetwork.id === 0)
      createNetworkMutation.mutate({
        title: editedNetwork.title,
      })
    else {
      updateNetworkMutation.mutate(editedNetwork)
    }
  }
  const logout = async () => {
    await logoutMutation.mutateAsync()
    queryClient.removeQueries(['networks'])
  }
  return (
    <div className="flex justify-center items-center flex-col min-h-screen text-gray-600 font-mono">
      <div className="flex items-center my-3">
        <ShieldCheckIcon className="h-8 w-8 mr-3 text-indigo-500 cursor-pointer" />
        <span className="text-center text-3xl font-extrabold">
          Network Manager
        </span>
      </div>
      <ArrowRightOnRectangleIcon
        onClick={logout}
        className="h-6 w-6 my-6 text-blue-500 cursor-pointer"
      />
      <form onSubmit={submitNetworkHandler}>
        <input
          className="mb-3 mr-3 px-3 py-2 border border-gray-300"
          placeholder="title ?"
          type="text"
          onChange={(e) =>
            updateNetwork({ ...editedNetwork, title: e.target.value })
          }
          value={editedNetwork.title || ''}
        />
        <button
          className="disabled:opacity-40 mx-3 py-2 px-3 text-white bg-indigo-600 rounded"
          disabled={!editedNetwork.title}
        >
          {editedNetwork.id === 0 ? 'Create' : 'Update'}
        </button>
      </form>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="my-5">
          {data?.map((network) => (
            <NetworkItem
              key={network.id}
              id={network.id}
              title={network.title}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
