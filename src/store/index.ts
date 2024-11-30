import { create } from "zustand"

type User = {
  id: number
  email: string
  isLoggedIn: boolean
  name: string
}

type EditedTask = {
  id: number
  title: string
}

type MigrationTrace = {
  migration_year: number
  id: number
  network_id: number
  latitude: number
  longitude: number
  location_name: string
  reason: string
}

type Connection = {
  targetId: number
  targetType: string
  strength: number
  type: string
  year: number
}

type EditedNetwork = {
  id: number
  user_id: number
  title: string
  type: string
  nationality: string
  ethnicity: string
  migration_year: number
  end_year: number
  latitude: number
  longitude: number
  migration_traces: MigrationTrace[] // Add migration traces
  connections: Connection[] // Add connections as an array
  photo?: File // Add photo field
}

type State = {
  user: User
  setUser: (user: User) => void
  resetUser: () => void
  editedTask: EditedTask
  updateEditedTask: (payload: EditedTask) => void
  resetEditedTask: () => void
  editedNetwork: EditedNetwork
  updateEditedNetwork: (payload: EditedNetwork) => void
  resetEditedNetwork: () => void
}

const useStore = create<State>((set) => ({
  user: { email: "", isLoggedIn: false, name: "" },
  setUser: (user) => set({ user }),
  resetUser: () => set({ user: { email: "", isLoggedIn: false, name: "" } }),
  editedTask: { id: 0, title: "" },
  updateEditedTask: (payload) => {
    set({
      editedTask: payload,
    })
  },
  resetEditedTask: () => {
    set({ editedTask: { id: 0, title: "" } })
  },
  // network
  editedNetwork: {
    id: 0,
    user_id: 0,
    title: "",
    type: "Migrant",
    nationality: "",
    ethnicity: "",
    migration_year: 0,
    end_year: 0,
    latitude: 0,
    longitude: 0,
    migration_traces: [],
    connections: [
      { targetType: "Migrant", targetId: 0, strength: 0, type: "", year: 0 },
    ],
    photo: undefined, // Add photo field
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
        title: "",
        type: "Migrant",
        nationality: "",
        ethnicity: "",
        migration_year: 0,
        end_year: 0,
        latitude: 0,
        longitude: 0,
        migration_traces: [],
        connections: [
          {
            targetType: "Migrant",
            targetId: 0,
            strength: 0,
            type: "",
            year: 0,
          },
        ],
        photo: undefined, // Add photo field
      },
    })
  },
}))

export default useStore
