import React from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP_LINK = "https://wa.me/5563992544417";

export default function WhatsAppFloatButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener"
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg shadow-green-900/30 transition-transform hover:scale-105"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </a>
  );
}