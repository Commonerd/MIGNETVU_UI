import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import dynamic from "next/dynamic"
import useStore from "../src/store"

const queryClient = new QueryClient({})
const Map = dynamic(() => import("../src/components/Map"), { ssr: false })

export default function Home() {
  const { user, setUser } = useStore()

  return (
    <QueryClientProvider client={queryClient}>
      <Map user={user} setUser={setUser} />{" "}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
