import { create } from 'zustand'

type User = {
  email: string
  isLoggedIn: boolean
  name: string
}

type EditedTask = {
  id: number
  title: string
}

type Connection = {
  targetId: number
  targetType: string
  strength: number
  type: string
}

type EditedNetwork = {
  id: number
  user_id: number
  title: string
  type: string
  nationality: string
  ethnicity: string
  migration_year: number
  latitude: number
  longitude: number
  connections: Connection[] // Add connections as an array
}

type State = {
  user: User
  setUser: (user: User) => void
  editedTask: EditedTask
  updateEditedTask: (payload: EditedTask) => void
  resetEditedTask: () => void
  editedNetwork: EditedNetwork
  updateEditedNetwork: (payload: EditedNetwork) => void
  resetEditedNetwork: () => void
}

const useStore = create<State>((set) => ({
  user: { email: '', isLoggedIn: false, name: '' },
  setUser: (user) => {
    set({ user })
  },
  editedTask: { id: 0, title: '' },
  updateEditedTask: (payload) => {
    set({
      editedTask: payload,
    })
  },
  resetEditedTask: () => {
    set({ editedTask: { id: 0, title: '' } })
  },
  // network
  editedNetwork: {
    id: 0,
    user_id: 0,
    title: '',
    type: '',
    nationality: '',
    ethnicity: '',
    migration_year: 0,
    latitude: 0,
    longitude: 0,
    connections: [], // Initialize connections as an empty array
  },
  updateEditedNetwork: (payload) => {
    set({
      editedNetwork: payload,
    })
  },
  resetEditedNetwork: () => {
    set({
      editedNetwork: {
        id: 0,
        user_id: 0,
        title: '',
        type: '',
        nationality: '',
        ethnicity: '',
        migration_year: 0,
        latitude: 0,
        longitude: 0,
        connections: [], // Reset connections as an empty array
      },
    })
  },
}))

export default useStore
