import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Info, LogIn, PlusCircle, User, LogOut } from "lucide-react"
import useStore from "../store"
import { useMutateAuth } from "../hooks/useMutateAuth"
import { useQueryClient } from "@tanstack/react-query"

const Header: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user, setUser } = useStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { logoutMutation } = useMutateAuth()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
    queryClient.removeQueries(["networks"])
    setUser({
      email: "",
      isLoggedIn: false,
      name: "",
      role: "",
      id: 0,
    })
    alert(t("logoutSuccess"))
    navigate("/")
    window.location.reload()
  }

  return (
    <header className="bg-[#3E2723] text-white p-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        {/* 첫 번째 줄: 로고와 앱 이름 */}
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <a
            href="https://docs.google.com/presentation/d/1PsSqYVnro9UOiiBeI-IvzCQpc5Vx57MKyte-UP90myY/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
          <Link to="/" className="flex items-center">
            <img
              src="/hisnetvu2.png"
              alt="Globe"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span className="text-xs sm:text-sm font-bold ml-1">HisNetVu</span>
            <span className="text-xs sm:text-sm font-bold ml-1 hidden sm:inline">
              {"   "}
              {t("appSubName")}
            </span>
          </Link>
        </div>

        {/* 두 번째 줄: 유저 정보 및 네비게이션 */}
        <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
          {user.isLoggedIn ? (
            <>
              {/* 유저명과 환영 메시지 */}
              <span className="text-xs sm:text-sm truncate max-w-[150px]">
                <span className="text-xs md:text-base truncate max-w-[500px]">
                  {user.name} ({t(user.role)})
                </span>
                {/* <span className="hidden sm:inline">{t("welcome")}</span> */}
              </span>

              {/* 네비게이션 아이콘 */}
              <Link
                to="/network"
                className="text-xs sm:text-sm flex items-center"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                {/* <span className="hidden sm:inline">{t("addNetwork")}</span> */}
              </Link>
              <Link
                to="/editprofile"
                className="text-xs sm:text-sm flex items-center"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                {/* <span className="hidden sm:inline">{t("editProfile")}</span> */}
              </Link>
              <button
                onClick={logout}
                className="text-xs sm:text-sm flex items-center"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                {/* <span className="hidden sm:inline">{t("logout")}</span> */}
              </button>

              {/* 언어 선택 */}
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-[#3E2723] text-white text-xs sm:text-sm border-none"
              >
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="ja">日本語</option>
                <option value="ru">Русский</option>
                <option value="es">Español</option>
                <option value="zh">中文</option>
              </select>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs sm:text-sm flex items-center"
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="hidden sm:inline">{t("login")}</span>
              </Link>
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-[#3E2723] text-white text-xs sm:text-sm border-none"
              >
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="ja">日本語</option>
                <option value="ru">Русский</option>
                <option value="es">Español</option>
                <option value="zh">中文</option>
              </select>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
