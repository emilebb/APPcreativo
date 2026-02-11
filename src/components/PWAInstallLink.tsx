 "use client";
 
 import { useEffect, useState } from "react";
 
 interface BeforeInstallPromptEvent extends Event {
   prompt: () => Promise<void>;
 }
 
 export default function PWAInstallLink() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <a id="installLink" onClick={onClick} style={{ display: "inline", cursor: "pointer" }}>
      💻 Descargar CreationX para PC
    </a>
  );
}
