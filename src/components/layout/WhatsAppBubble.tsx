"use client";

import { useEffect, useState } from "react";

export default function WhatsAppBubble() {
  const [whatsappNumber, setWhatsappNumber] = useState(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber);
        }
      })
      .catch(() => {});
  }, []);

  if (!whatsappNumber) return null;

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
  const chatUrl = "https://wa.me/" + cleanNumber;

  return (
    <a
      href={chatUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg hover:bg-green-600"
    >
      💬
    </a>
  );
}