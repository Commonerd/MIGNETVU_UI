import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Auth } from './components/Auth'
import { Todo } from './components/Todo'
import './i18n'

import axios from 'axios'
import { CsrfToken } from './types'
import Header from './components/Header'
import Footer from './components/Footer'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import NetworkForm from './components/NetworkForm'
import Register from './components/Register'
import Login from './components/Login'
import Map from './components/Map'

function App() {
  useEffect(() => {
    axios.defaults.withCredentials = true
    const getCsrfToken = async () => {
      const { data } = await axios.get<CsrfToken>(
        `${process.env.REACT_APP_API_URL}/csrf`,
      )
      axios.defaults.headers.common['X-CSRF-Token'] = data.csrf_token
    }
    getCsrfToken()
  }, [])

  const { t } = useTranslation()
  const [user, setUser] = useState<{ email: string; isLoggedIn: boolean }>({
    email: '',
    isLoggedIn: false,
  })
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header user={user} setUser={setUser} />{' '}
        <main className="flex-grow">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/todo" element={<Todo />} />
            {/* 잠정 */}
            <Route path="/" element={<Map user={user} setUser={setUser} />} />
            <Route path="/add-network" element={<NetworkForm />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
