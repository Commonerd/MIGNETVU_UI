import React from "react"
import { useTranslation } from "react-i18next"

const Footer: React.FC = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear() // 현재 연도 계산

  return (
    <footer className="bg-gray-800 text-white p-2 text-xs fixed bottom-0 w-full sm:p-4 sm:text-sm">
      <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center text-center leading-tight sm:leading-normal">
        <div className="text-center leading-tight sm:leading-normal">
          {/* 모바일: 한 줄로 표시 / 데스크톱: 세로선 구분 */}
          <p className="block sm:hidden text-[14px] font-bold">
            &copy; {currentYear} Dr. Song Younghwa. {t("allRightsReserved")}{" "}
            <br />• {t("OperaionTime")}: 09:00-18:00 •{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/1w7UqUIv3rfTncO6qTiujo7W_BgFBNVQkOf2BH4Xgkjs/edit?gid=0#gid=0"
              className="text-blue-400"
              target="_blank" // 새 창으로 열기
              rel="noopener noreferrer" // 보안 강화
            >
              {t("Inquiry")}{" "}
            </a>
          </p>
          <p className="hidden sm:block">
            &copy; {currentYear} Dr. Song Younghwa {t("allRightsReserved")} |{" "}
            {t("OperaionTime")}: 09:00-18:00 |{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/1w7UqUIv3rfTncO6qTiujo7W_BgFBNVQkOf2BH4Xgkjs/edit?gid=0#gid=0"
              className="text-blue-400"
              target="_blank" // 새 창으로 열기
              rel="noopener noreferrer" // 보안 강화
            >
              {t("Inquiry")}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
