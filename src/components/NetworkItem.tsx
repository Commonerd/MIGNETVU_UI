import { FC, memo } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import useStore from '../store'
import { Network } from '../types'
import { useMutateNetwork } from '../hooks/useMutateNetwork'

const NetworkItemMemo: FC<Omit<Network, 'created_at' | 'updated_at'>> = ({
  id,
  title,
}) => {
  const updateNetwork = useStore((state) => state.updateEditedNetwork)
  const { deleteNetworkMutation } = useMutateNetwork()
  return (
    <li className="my-3">
      <span className="font-bold">{title}</span>
      <div className="flex float-right ml-20">
        <PencilIcon
          className="h-5 w-5 mx-1 text-blue-500 cursor-pointer"
          onClick={() => {
            updateNetwork({
              id: id,
              title: title,
            })
          }}
        />
        <TrashIcon
          className="h-5 w-5 text-blue-500 cursor-pointer"
          onClick={() => {
            deleteNetworkMutation.mutate(id)
          }}
        />
      </div>
    </li>
  )
}
export const NetworkItem = memo(NetworkItemMemo)
