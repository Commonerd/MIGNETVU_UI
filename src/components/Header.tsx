import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, User, UserPlus, LogOut } from "lucide-react";

interface HeaderProps {
  user: { email: string; isLoggedIn: boolean };
  setUser: React.Dispatch<
    React.SetStateAction<{ email: string; isLoggedIn: boolean }>
  >;
}

const Header: React.FC<HeaderProps> = ({ user, setUser }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    setUser({ email: "", isLoggedIn: false }); // 로그아웃 시 사용자 상태 초기화
    sessionStorage.removeItem("isLoggedIn"); // 로그인 정보 삭제
    alert(t("logoutSuccess"));
    navigate("/");    // 로그아웃 후 홈으로 이동
  };

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <Globe className="mr-2" />
          <span className="text-xl font-bold">MigNetVu </span>
          <span className="text-sm font-bold">　{t("appSubName")} </span>
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {user.isLoggedIn ? (
              <>
                <li>
                  <span className="mr-2">
                    {user.email.split("@")[0]}
                    {t("welcome")}
                  </span>
                </li>
                <li>
                  <Link to="/add-network" className="flex items-center">
                    <UserPlus className="mr-1" />
                    {t("addNetwork")}
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="flex items-center">
                    <LogOut className="mr-1" /> {t("logout")}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="flex items-center">
                    <User className="mr-1" /> {t("login")}
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="flex items-center">
                    <UserPlus className="mr-1" /> {t("register")}
                  </Link>
                </li>
              </>
            )}
            <li>
              <select
                value={i18n.language} // 현재 언어를 드롭다운의 기본값으로 설정
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-blue-500 text-white"
              >
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="ja">日本語</option>
                <option value="ru">Русский</option>
                <option value="es">español</option>
                <option value="zh">中文</option>
              </select>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
