import { useState } from "react";

export const useReportsModal = () => {
  const [configModal, setConfigModal] = useState({
    isOpen: false,
    type:   null,
    config: null,
  });

  const openAnalytics = (moduleId) =>
    setConfigModal({ isOpen: true, type: moduleId, config: "analytics" });

  const openDownload  = (moduleId) =>
    setConfigModal({ isOpen: true, type: moduleId, config: "download"  });

  const openPreview   = (moduleId) =>                                    // ← NEW
    setConfigModal({ isOpen: true, type: moduleId, config: "preview"   });

  const closeModal = () =>
    setConfigModal({ isOpen: false, type: null, config: null });

  return { configModal, openAnalytics, openDownload, openPreview, closeModal };
};