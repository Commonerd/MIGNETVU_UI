"use client"
import { useState, useEffect } from "react"
import Modal from "react-modal"
import { useTranslation } from "react-i18next"

Modal.setAppElement("body")

export default function GuideModal() {
  const [guideStep, setGuideStep] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const lastDismissed = localStorage.getItem("guideDismissedAt")
    if (
      !lastDismissed ||
      new Date().getTime() - parseInt(lastDismissed) > 30 * 24 * 60 * 60 * 1000
    ) {
      setIsModalOpen(true)
    }
  }, [])

  const handleViewGuide = () => {
    const guideUrl =
      i18n.language === "ja"
        ? "https://docs.google.com/presentation/d/1PsSqYVnro9UOiiBeI-IvzCQpc5Vx57MKyte-UP90myY/edit?slide=id.g34af6f1bf9f_0_370#slide=id.g34af6f1bf9f_0_370"
        : "https://docs.google.com/presentation/d/1PsSqYVnro9UOiiBeI-IvzCQpc5Vx57MKyte-UP90myY/edit?slide=id.g34af6f1bf9f_0_370#slide=id.g34af6f1bf9f_0_370"
    window.open(guideUrl, "_blank")
    if (dontShowAgain) {
      localStorage.setItem("guideDismissedAt", new Date().getTime().toString())
    }
    setIsModalOpen(false)
    setGuideStep(0)
  }

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem("guideDismissedAt", new Date().getTime().toString())
    }
    setIsModalOpen(false)
    setGuideStep(0)
  }

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={() => setIsModalOpen(false)}
      className="bg-[#f5f5f5] bg-opacity-80 p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center"
    >
      <h2 className="text-lg font-bold mb-4 text-[#3E2723]">
        {t("User Guide")}
      </h2>
      <p className="mb-4 text-sm text-[#5D4037]">{t("Product Description")}</p>
      <div className="p-2 bg-[#fffbe6] border-b border-[#9e9d89] text-sm mb-2 rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-[#3E2723]">
            예시: {t("Step")} {guideStep} / 3
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setGuideStep((prev) => Math.max(1, prev - 1))}
              disabled={guideStep === 1}
              className={`px-2 py-1 rounded ${guideStep === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#BCAAA4] text-[#3E2723] hover:bg-[#A1887F]"}`}
            >
              {t("Prev")}
            </button>
            {guideStep < 3 ? (
              <button
                onClick={() => setGuideStep((prev) => Math.min(3, prev + 1))}
                className="px-2 py-1 rounded bg-[#FFAB91] text-[#3E2723] hover:bg-[#FF8A65]"
              >
                {t("Next")}
              </button>
            ) : (
              <button
                onClick={handleDismiss}
                className="px-2 py-1 rounded bg-[#3e2723] text-white hover:bg-[#5d4037]"
              >
                {t("Finish")}
              </button>
            )}
          </div>
        </div>
        <div>
          {guideStep === 1 && (
            <span
              dangerouslySetInnerHTML={{
                __html: t("한국 국적을 지닌 한인의 관계와 이동"),
              }}
            />
          )}
          {guideStep === 2 && (
            <span
              dangerouslySetInnerHTML={{
                __html: t("러시아 국적을 지닌 한인의 관계와 이동"),
              }}
            />
          )}
          {guideStep === 3 && (
            <span
              dangerouslySetInnerHTML={{
                __html: t("한국계 러시아인 정재관의 이동"),
              }}
            />
          )}
        </div>
      </div>
      <p className="mb-4 text-sm text-[#5D4037]">
        {t("Would you like to view the user guide?")}
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="bg-[#D7CCC8] text-[#3E2723] px-4 py-2 rounded hover:bg-[#BCAAA4] transition"
          >
            {t("No")}
          </button>
          <button
            onClick={handleViewGuide}
            className="bg-[#FFAB91] text-[#3E2723] px-4 py-2 rounded hover:bg-[#FF8A65] transition"
          >
            {t("Yes")}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="dontShowAgain"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 text-[#3E2723] border-gray-300 rounded focus:ring-[#795548]"
          />
          <label htmlFor="dontShowAgain" className="text-sm text-[#5D4037]">
            {t("Do not show again for 30 days")}
          </label>
        </div>
      </div>
    </Modal>
  )
}
