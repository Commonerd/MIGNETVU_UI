import { useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Auth } from "../components/Auth"
import { Todo } from "../components/Todo"
import "./i18n"

import axios from "axios"
import { CsrfToken } from "../types"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { useTranslation } from "react-i18next"
import { useState } from "react"
// import NetworkForm from "./components/NetworkForm"
// import Register from "./components/Register"
// import Login from "./components/Login"
import Map from "../components/Map"
// import { Network } from "./components/Network"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import useStore from "../store"
// import EditProfile from "./components/EditProfile"
import Modal from "react-modal"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { useQueryAllNetworksOnMap } from "../hooks/useQueryNetworks"

Modal.setAppElement("#root") // 모달 접근성을 위한 설정
function App() {
  const [guideStep, setGuideStep] = useState(1)

  const { data: networks = [] } = useQueryAllNetworksOnMap()

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
      i18n.language === "ja"
        ? // ? "https://docs.google.com/presentation/d/1ExYqnvf2o3_ClSi5emWLm2r5RPeclXi0WpcrBAzsnto/edit?slide=id.g34dba400f31_0_157#slide=id.g34dba400f31_0_157"
          "https://docs.google.com/presentation/d/1PsSqYVnro9UOiiBeI-IvzCQpc5Vx57MKyte-UP90myY/edit?slide=id.g34af6f1bf9f_0_370#slide=id.g34af6f1bf9f_0_370"
        : "https://docs.google.com/presentation/d/1PsSqYVnro9UOiiBeI-IvzCQpc5Vx57MKyte-UP90myY/edit?slide=id.g34af6f1bf9f_0_370#slide=id.g34af6f1bf9f_0_370"
    window.open(guideUrl, "_blank")
    if (dontShowAgain) {
      localStorage.setItem("guideDismissedAt", new Date().getTime().toString())
    }
    setIsModalOpen(false)
    setGuideStep(0) // Set guideStep to 0 when modal is closed
  }

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem("guideDismissedAt", new Date().getTime().toString())
    }
    setIsModalOpen(false)
    setGuideStep(0) // Set guideStep to 0 when modal is closed
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
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />{" "}
            <main className="flex-grow mb-16">
              {" "}
              {/* mb-16 to account for the fixed footer height */}
              {/* <Routes>
                <Route
                  path="/"
                  element={ */}
              <Map
                user={user}
                setUser={setUser}
                guideStep={guideStep}
                networks={networks}
              />
              {/* }
                /> */}
              {/* <Route path="/login" element={<Auth />} />
                <Route path="/network" element={<Network />} />
                <Route path="/editprofile" element={<EditProfile />} />
                <Route path="/todo" element={<Todo />} /> */}
              {/* 잠정 */}
              {/* <Route path="/add-network" element={<NetworkForm />} /> */}
              {/* <Route path="/login" element={<Login setUser={setUser} />} /> */}
              {/* <Route path="/register" element={<Register setUser={setUser} />} /> */}
              {/* </Routes> */}
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
                {t("Product Description")}
              </p>
              {/* 단계별 안내 */}
              <div className="p-2 bg-[#fffbe6] border-b border-[#9e9d89] text-sm mb-2 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#3E2723]">
                    예시: {t("Step")} {guideStep} / 3
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setGuideStep((prev) => Math.max(1, prev - 1))
                      }
                      disabled={guideStep === 1}
                      className={`px-2 py-1 rounded ${guideStep === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#BCAAA4] text-[#3E2723] hover:bg-[#A1887F]"}`}
                    >
                      {t("Prev")}
                    </button>
                    {guideStep < 3 ? (
                      <button
                        onClick={() =>
                          setGuideStep((prev) => Math.min(3, prev + 1))
                        }
                        className="px-2 py-1 rounded bg-[#FFAB91] text-[#3E2723] hover:bg-[#FF8A65]"
                      >
                        {t("Next")}
                      </button>
                    ) : (
                      <button
                        onClick={handleDismiss}
                        className="px-2 py-1 rounded bg-[#3e2723] text-white hover:bg-[#5d4037]"
                      >
                        {t("Finish")}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  {guideStep === 1 && (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: t("한국 국적을 지닌 한인의 관계와 이동"),
                      }}
                    />
                  )}
                  {guideStep === 2 && (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: t("러시아 국적을 지닌 한인의 관계와 이동"),
                      }}
                    />
                  )}
                  {guideStep === 3 && (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: t("한국계 러시아인 정재관의 이동"),
                      }}
                    />
                  )}
                </div>
              </div>
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
    </GoogleOAuthProvider>
  )
}

export default App
