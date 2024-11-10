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

type EditedNetwork = {
  id: number
  title: string
}

type State = {
  user: User
  setUser: (user: User) => void // setUser 함수 추가
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
  }, // setUser 함수 구현
  editedTask: { id: 0, title: '' },
  updateEditedTask: (payload) => {
    set({
      editedTask: payload,
    })
  },
  resetEditedTask: () => {
    set({ editedTask: { id: 0, title: '' } })
  },
  // 네트워크 수정 상태관리
  editedNetwork: { id: 0, title: '' },
  updateEditedNetwork: (payload) => {
    set({
      editedNetwork: payload,
    })
  },
  resetEditedNetwork: () => {
    set({ editedNetwork: { id: 0, title: '' } })
  },
}))

export default useStore
