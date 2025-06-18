import dynamic from "next/dynamic"
import NetworkSummaryTable from "../components/NetworkSummaryTable"
import { useState } from "react"
import useStore from "../store"
import Header from "../components/Header"
import Footer from "../components/Footer"

const Map = dynamic(() => import("../components/Map"), { ssr: false })

export async function getServerSideProps() {
  const networks = await fetchNetworksFromDB()
  return { props: { networks } }
}

export default function Home({ networks }: { networks: any[] }) {
  const { user, setUser } = useStore()
  const [guideStep, setGuideStep] = useState(1)
  return (
    <>
      <Header />
      <main>
        <NetworkSummaryTable networks={networks} />
        <Map
          user={user}
          setUser={setUser}
          guideStep={guideStep}
          networks={networks}
        />
      </main>
      <Footer />
    </>
  )
}

// 아래 fetchNetworksFromDB 함수도 같이 선언
async function fetchNetworksFromDB() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/networks/map`)
    if (!res.ok) throw new Error("Failed to fetch networks")
    return await res.json()
  } catch (err) {
    console.error("fetchNetworksFromDB error:", err)
    throw err
  }
}
