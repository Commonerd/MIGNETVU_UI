import { create } from "zustand"
import { Edge } from "../types"

type User = {
  id: number
  email: string
  isLoggedIn: boolean
  name: string
  role: string
}

type EditedTask = {
  id: number
  title: string
}

type MigrationTrace = {
  migration_year: string
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
  year: string
}

type EditedNetwork = {
  id: number
  user_id: number
  title: string
  type: string
  nationality: string
  ethnicity: string
  migration_year: string
  end_year: string
  latitude: number
  longitude: number
  migration_traces: MigrationTrace[] // Add migration traces
  connections: Connection[] // Add connections as an array
  edge: Edge[]
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
  user: { id: 0, email: "", isLoggedIn: false, name: "", role: "" },
  setUser: (user) => set({ user }),
  resetUser: () =>
    set({ user: { id: 0, email: "", isLoggedIn: false, name: "", role: "" } }),
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
    type: "Person",
    nationality: "",
    ethnicity: "",
    migration_year: "",
    end_year: "",
    latitude: 0,
    longitude: 0,
    migration_traces: [],
    connections: [
      { targetType: "Person", targetId: 0, strength: 0, type: "", year: 0 },
    ],
    edge: [
      {
        targetId: 0,
        targetType: "Person",
        strength: 0,
        edgeType: "",
        year: "",
        id: 0,
      },
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
        type: "Person",
        nationality: "",
        ethnicity: "",
        migration_year: "",
        end_year: "",
        latitude: 0,
        longitude: 0,
        migration_traces: [],
        connections: [
          {
            targetType: "Person",
            targetId: 0,
            strength: 0,
            type: "",
            year: "",
          },
        ],
        edge: [
          {
            targetId: 0,
            targetType: "Person",
            strength: 0,
            edgeType: "",
            year: "",
            id: 0,
          },
        ],
        photo: undefined, // Add photo field
      },
    })
  },
}))

export default useStore
