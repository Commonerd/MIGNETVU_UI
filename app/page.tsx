"use client"
import Map from "./components/Map"
import useStore from "./store"

export default function HomePage() {
  const { user, setUser } = useStore()
  // 필요한 props를 Map에 전달
  return <Map user={user} setUser={setUser} />
}
