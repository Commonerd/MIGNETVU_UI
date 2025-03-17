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

  const queryClient = new QueryClient()

  const { user, setUser } = useStore()

  useEffect(() => {
    const fetchUserState = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
          credentials: "include", // 쿠키를 포함해 요청
        })
        if (res.ok) {
          const user = await res.json()
          setUser({ email: user.email, isLoggedIn: true, name: user.name })
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
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
