import { useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Auth } from "./components/Auth"
import { Todo } from "./components/Todo"
import "./i18n"

import axios from "axios"
import { CsrfToken } from "./types"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import NetworkForm from "./components/NetworkForm"
import Register from "./components/Register"
import Login from "./components/Login"
import Map from "./components/Map"
import { Network } from "./components/Network"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import useStore from "./store"
import EditProfile from "./components/EditProfile"
import Modal from "react-modal"

Modal.setAppElement("#root") // 모달 접근성을 위한 설정
function App() {
  useEffect(() => {
    axios.defaults.withCredentials = true
    const getCsrfToken = async () => {
      const { data } = await axios.get<CsrfToken>(
        `${process.env.REACT_APP_API_URL}/csrf`,
      )
      axios.defaults.headers.common["X-CSRF-Token"] = data.csrf_token
    }
    getCsrfToken()
  }, [])

  const { t } = useTranslation()
  const { i18n } = useTranslation()

  const queryClient = new QueryClient()

  const { user, setUser } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    const lastDismissed = localStorage.getItem("guideDismissedAt")
    if (
      !lastDismissed ||
      new Date().getTime() - parseInt(lastDismissed) > 30 * 24 * 60 * 60 * 1000
    ) {
      setIsModalOpen(true)
    }
  }, [])

  const handleViewGuide = () => {
    const guideUrl =
      i18n.language === "ja" ? "https://url.kr/pf4qqc" : "https://url.kr/xp3x6k"
    window.open(guideUrl, "_blank")
    if (dontShowAgain) {
      localStorage.setItem("guideDismissedAt", new Date().getTime().toString())
    }
    setIsModalOpen(false)
  }

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem("guideDismissedAt", new Date().getTime().toString())
    }
    setIsModalOpen(false)
  }

  useEffect(() => {
    const fetchUserState = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
          credentials: "include", // 쿠키를 포함해 요청
        })
        if (res.ok) {
          const user = await res.json()
          setUser({
            id: user.id,
            email: user.email,
            isLoggedIn: true,
            name: user.name,
            role: user.role,
          })
        }
      } catch (error) {
        console.error("Failed to sync user state:", error)
      }
    }

    fetchUserState()
  }, [setUser])

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Header />{" "}
          <main className="flex-grow mb-16">
            {" "}
            {/* mb-16 to account for the fixed footer height */}
            <Routes>
              <Route path="/login" element={<Auth />} />
              <Route path="/network" element={<Network />} />
              <Route path="/editprofile" element={<EditProfile />} />
              <Route path="/todo" element={<Todo />} />
              {/* 잠정 */}
              <Route path="/" element={<Map user={user} setUser={setUser} />} />
              {/* <Route path="/add-network" element={<NetworkForm />} /> */}
              {/* <Route path="/login" element={<Login setUser={setUser} />} /> */}
              {/* <Route path="/register" element={<Register setUser={setUser} />} /> */}
            </Routes>
          </main>{" "}
          <Footer />
          {/* 모달 */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            className="bg-[#f5f5f5] bg-opacity-80 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
            overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center"
          >
            <h2 className="text-lg font-bold mb-4 text-[#3E2723]">
              {t("User Guide")}
            </h2>
            <p className="mb-4 text-sm text-[#5D4037]">
              {t("Would you like to view the user guide?")}
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleDismiss}
                  className="bg-[#D7CCC8] text-[#3E2723] px-4 py-2 rounded hover:bg-[#BCAAA4] transition"
                >
                  {t("No")}
                </button>
                <button
                  onClick={handleViewGuide}
                  className="bg-[#FFAB91] text-[#3E2723] px-4 py-2 rounded hover:bg-[#FF8A65] transition"
                >
                  {t("Yes")}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dontShowAgain"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 text-[#3E2723] border-gray-300 rounded focus:ring-[#795548]"
                />
                <label
                  htmlFor="dontShowAgain"
                  className="text-sm text-[#5D4037]"
                >
                  {t("Do not show again for 30 days")}
                </label>
              </div>
            </div>
          </Modal>
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
