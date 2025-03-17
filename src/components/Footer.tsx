import React from "react"
import { useTranslation } from "react-i18next"

const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-800 text-white p-4">
      <div className="container mx-auto text-center">
        <p>
          &copy; 2024 {t("Dr. Song Younghwa")}. {t("allRightsReserved")} /{" "}
          09:00-18:00 /
          <a href="mailto:41m@naver.com" className="text-blue-400">
            {" "}
            41m@naver.com
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
