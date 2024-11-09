import { create } from 'zustand'

type User = {
  email: string
  isLoggedIn: boolean
}

type EditedTask = {
  id: number
  title: string
}

type State = {
  user: User
  setUser: (user: User) => void // setUser 함수 추가
  editedTask: EditedTask
  updateEditedTask: (payload: EditedTask) => void
  resetEditedTask: () => void
}

const useStore = create<State>((set) => ({
  user: { email: '', isLoggedIn: false },
  setUser: (user) => set({ user }), // setUser 함수 구현
  editedTask: { id: 0, title: '' },
  updateEditedTask: (payload) =>
    set({
      editedTask: payload,
    }),
  resetEditedTask: () => set({ editedTask: { id: 0, title: '' } }),
}))

export default useStore
