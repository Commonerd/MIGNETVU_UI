import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Globe,
  User,
  UserPlus,
  LogOut,
  Edit,
  Edit2Icon,
  PlusCircle,
  UserCheck,
  LucideEdit2,
  FileText,
  Info,
  LogIn,
} from "lucide-react"
import useStore from "../store"
import { useMutateAuth } from "../hooks/useMutateAuth"
import { useQueryClient } from "@tanstack/react-query"

const Header: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user, setUser } = useStore() // user 상태 가져오기
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
    }) // 로그아웃 시 사용자 상태 초기화
    alert(t("logoutSuccess"))
    navigate("/") // 로그아웃 후 홈으로 이동
    window.location.reload()
  }

  return (
    <header className="bg-[#3E2723] text-white p-4">
      <div className="container mx-auto flex items-center flex-nowrap">
        <a
          href="https://docs.google.com/presentation/d/1PsSqYVnro9UOiiBeI-IvzCQpc5Vx57MKyte-UP90myY/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-xs md:text-base"
        >
          <Info className="mr-1" />
        </a>
        <Link to="/" className="flex items-center ml-[4px]">
          {" "}
          {/* 앱 명 왼쪽으로 이동 */}
          <img
            src="/hisnetvu2.png"
            alt="Globe"
            className="mr-2 w-4 h-4 md:w-6 md:h-6"
          />
          <span className="text-xs md:text-lg font-bold mr-3">HisNetVu </span>
          <span className="text-xs md:text-sm font-bold">
            {"   "}
            {t("appSubName")}
          </span>
        </Link>

        {/* 네비게이션을 오른쪽으로 밀어넣음 */}
        <nav className="ml-auto flex items-center gap-x-2 md:gap-x-3 justify-end">
          {user.isLoggedIn ? (
            <>
              <span className="text-xs md:text-base truncate max-w-[500px]">
                {user.name} ({t(user.role)}) {t("welcome")}
              </span>
              <Link
                to="/network"
                className="flex items-center text-xs md:text-base"
              >
                <PlusCircle className="mr-1" />
                {/* {t("addNetwork")} */}
              </Link>
              <Link
                to="/editprofile"
                className="flex items-center text-xs md:text-base"
              >
                <User className="mr-1" />
                {/* {t("editProfile")} */}
              </Link>
              <button
                onClick={logout}
                className="flex items-center text-xs md:text-base"
              >
                <LogOut className="mr-1" />
                {/* {t("logout")} */}
              </button>
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-[#3E2723] text-white text-xs md:text-base border-none p-0"
              >
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="ja">日本語</option>
                <option value="ru">Русский</option>
                <option value="es">español</option>
                <option value="zh">中文</option>
              </select>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center text-xs md:text-base"
              >
                <LogIn className="mr-1" />
                {/* {t("login")} */}
              </Link>
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-[#3E2723] text-white text-xs md:text-base border-none p-0"
              >
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="ja">日本語</option>
                <option value="ru">Русский</option>
                <option value="es">español</option>
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
