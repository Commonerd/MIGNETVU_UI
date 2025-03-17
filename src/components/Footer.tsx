import React from "react"
import { useTranslation } from "react-i18next"

const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-800 text-white p-4 fixed bottom-0 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-grow text-center">
          <p>
            &copy; 2024 Dr. Song Younghwa. {t("allRightsReserved")} /{" "}
            {t("OperaionTime")} : 09:00-18:00 / {t("Inquiry")} :
            <a href="mailto:41m@naver.com" className="text-blue-400">
              {" "}
              41m@naver.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
