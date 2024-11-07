import React from "react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white p-4">
      <div className="container mx-auto text-center">
        <p>
          &copy; 2024 {t("appName")}. {t("allRightsReserved")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
