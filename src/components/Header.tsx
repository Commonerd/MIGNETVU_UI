import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe, User, UserPlus, LogOut } from 'lucide-react'
import useStore from '../store'

const Header: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user, setUser } = useStore() // user 상태 가져오기
  const navigate = useNavigate()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const handleLogout = () => {
    setUser({ email: '', isLoggedIn: false, name: '' }) // 로그아웃 시 사용자 상태 초기화
    alert(t('logoutSuccess'))
    
    navigate('/') // 로그아웃 후 홈으로 이동
    window.location.reload()
  }

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <Link to="/" className="flex items-center mb-2 md:mb-0">
          <Globe className="mr-2 w-4 h-4 md:w-6 md:h-6" />
          <span className="text-xs md:text-lg font-bold">MigNetVu </span>
          <span className="text-xs md:text-sm font-bold">
            　{t('appSubName')}{' '}
          </span>
        </Link>
        <nav className="w-full md:w-auto">
          <ul className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-4">
            {user.isLoggedIn ? (
              <>
                <li>
                  <span className="mr-2 text-xs md:text-base">
                    {user.name}
                    {t('welcome')}
                  </span>
                </li>
                <li>
                  <Link
                    to="/add-network"
                    className="flex items-center text-xs md:text-base"
                  >
                    <UserPlus className="mr-1" />
                    {t('addNetwork')}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-xs md:text-base"
                  >
                    <LogOut className="mr-1" /> {t('logout')}
                  </button>
                </li>
                <select
                  value={i18n.language} // 현재 언어를 드롭다운의 기본값으로 설정
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-blue-500 text-white text-xs md:text-base"
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
                <li className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="flex items-center text-xs md:text-base"
                  >
                    <User className="mr-1" /> {t('login')}
                  </Link>
                  {/* <Link
                    to="/register"
                    className="flex items-center text-xs md:text-base"
                  >
                    <UserPlus className="mr-1" /> {t("register")}
                  </Link> */}
                  <select
                    value={i18n.language} // 현재 언어를 드롭다운의 기본값으로 설정
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="bg-blue-500 text-white text-xs md:text-base"
                  >
                    <option value="en">English</option>
                    <option value="ko">한국어</option>
                    <option value="ja">日本語</option>
                    <option value="ru">Русский</option>
                    <option value="es">español</option>
                    <option value="zh">中文</option>
                  </select>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
