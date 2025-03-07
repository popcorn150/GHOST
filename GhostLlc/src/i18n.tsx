import React, { createContext, useContext, useState, ReactNode } from "react";

// Example translations for demonstration
const translations = {
  en: {
    back: "Back",
    settings: "Settings",
    checkUpdate: "Check Update",
    downloadAndInstall: "Download and Install",
    downloadInstructions:
      "Downloading via mobile networks may result in additional charges. If possible, download via a Wi-Fi network instead.",
    autoDownloadOverWifi: "Auto download over Wi-Fi",
    autoDownloadText:
      "Download software updates automatically when connected to Wi-Fi network.",
    lastUpdate: "Last update",
    lastCheckedOn: (params: { date: string }) =>
      `Last checked on ${params.date}`,
    changeLanguage: "Change Language",
    default: "Default",
    feedback: "Feedback",
    feedbackPrompt: "What's your feedback about?",
    viewingExperience: "Viewing Experience",
    navigationSystem: "Navigation system",
    uploading: "Uploading",
    tellUsMore: "Tell us a little more (Optional)",
    feedbackPlaceholder:
      "Please tell us any other issues we should look into in detail.",
    submit: "Submit",
    aboutUs: "About Us",
    aboutUsText: "Visit our website for more info",
    privacyPolicy: "Privacy Policy",
    privacyPolicyTitle: "Our Privacy Policy",
    privacyPolicyText:
      "We take your privacy seriously. Please read the following guidelines to understand how we handle your personal data.",
    userAgreement: "User Agreement",
    userAgreementTitle: "User Agreement",
    userAgreementText: "Visit our website for more info",
    changeProfile: "Change profile",
    clickToChangeProfile: "Click on your profile to make a change.",
    deleteAccount: "Delete Account",
    feedbackSubmitted: "Feedback submitted successfully!",
  },
  // You can add more languages here
  es: {
    back: "Atrás",
    settings: "Configuraciones",
    checkUpdate: "Verificar Actualización",
    downloadAndInstall: "Descargar e Instalar",
    downloadInstructions:
      "Descargar mediante redes móviles puede resultar en cargos adicionales. Si es posible, descarga a través de una red Wi-Fi.",
    autoDownloadOverWifi: "Descarga automática por Wi-Fi",
    autoDownloadText:
      "Descarga actualizaciones de software automáticamente cuando estás conectado a Wi-Fi.",
    lastUpdate: "Última actualización",
    lastCheckedOn: (params: { date: string }) =>
      `Última verificación el ${params.date}`,
    changeLanguage: "Cambiar Idioma",
    default: "Predeterminado",
    feedback: "Retroalimentación",
    feedbackPrompt: "¿Sobre qué es tu retroalimentación?",
    viewingExperience: "Experiencia de visualización",
    navigationSystem: "Sistema de navegación",
    uploading: "Subiendo",
    tellUsMore: "Cuéntanos un poco más (Opcional)",
    feedbackPlaceholder:
      "Por favor cuéntanos otros problemas que debamos revisar en detalle.",
    submit: "Enviar",
    aboutUs: "Sobre Nosotros",
    aboutUsText: "Visita nuestro sitio web para más información",
    privacyPolicy: "Política de Privacidad",
    privacyPolicyTitle: "Nuestra Política de Privacidad",
    privacyPolicyText:
      "Nos tomamos muy en serio tu privacidad. Lee las siguientes pautas para entender cómo manejamos tus datos personales.",
    userAgreement: "Acuerdo de Usuario",
    userAgreementTitle: "Acuerdo de Usuario",
    userAgreementText: "Visita nuestro sitio web para más información",
    changeProfile: "Cambiar perfil",
    clickToChangeProfile: "Haz clic en tu perfil para hacer un cambio.",
    deleteAccount: "Eliminar cuenta",
    feedbackSubmitted: "¡Retroalimentación enviada con éxito!",
  },
};

interface I18nContextProps {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: any) => string;
}

const I18nContext = createContext<I18nContextProps>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useI18n = () => useContext(I18nContext);

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  defaultLanguage = "en",
}) => {
  const [language, setLanguage] = useState(defaultLanguage);

  const t = (key: string, params?: any): string => {
    const translation = translations[language][key];
    if (typeof translation === "function") {
      return translation(params);
    }
    return translation || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};
