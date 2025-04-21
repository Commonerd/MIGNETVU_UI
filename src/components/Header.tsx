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
    <header className="bg-[#3E2723] text-white p-2 sm:p-4">
      <div className="container mx-auto flex items-center justify-between gap-2">
        {/* 왼쪽: Info 아이콘 + 앱 로고 및 이름 */}
        <div className="flex items-center gap-1">
          <a
            href={
              i18n.language === "ja"
                ? "https://url.kr/y2rua7"
                : "https://docs.google.com/presentation/d/1PsSqYVnro9UOiiBeI-IvzCQpc5Vx57MKyte-UP90myY/edit?usp=sharing"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
          <Link to="/" className="flex items-center gap-1">
            <img
              src="/hisnetvu2.png"
              alt="Globe"
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            <span className="text-sm sm:text-base font-bold">HisNetVu</span>
            <span className="hidden sm:block text-xs md:text-sm font-bold">
              {"   "}
              {t("appSubName")}
            </span>
          </Link>
        </div>

        {/* 가운데 간격 추가 */}
        <div className="flex-grow gap-2"></div>

        {/* 오른쪽: 유저 정보 및 네비게이션 */}
        <div className="flex items-center gap-1 sm:gap-1">
          {user.isLoggedIn ? (
            <>
              {/* 유저명 및 역할 */}
              <span className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">
                {user.name} ({t(user.role)})
              </span>

              {/* 네비게이션 아이콘 */}
              <Link to="/network" className="flex items-center">
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link to="/editprofile" className="flex items-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <button onClick={logout} className="flex items-center">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center">
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-xs sm:text-sm">
                  {t("login")}
                </span>
              </Link>
            </>
          )}

          {/* 언어 선택: 데스크톱에서는 항상 보이고, 모바일에서는 로그인하지 않은 경우에만 표시 */}
          {!user.isLoggedIn || window.innerWidth >= 640 ? (
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
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Header
