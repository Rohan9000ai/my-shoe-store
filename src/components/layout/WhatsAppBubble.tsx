"use client";

import { useEffect, useState } from "react";

// Reads the WhatsApp number from live admin settings (falls back to the
// .env value until an admin saves one via /admin/settings), so changes
// made in the admin panel actually take effect on the storefront.
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
      .catch(() => {
        // Keep the env fallback if settings can't be fetched.
      });
  }, []);

  if (!whatsappNumber) return null;

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <a
      href={`https://wa.me/${cleanNumber}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg hover:bg-green-600"
    >
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 fill-white"
        aria-hidden="true"
      >
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.34.687 4.523 1.87 6.36L4 29l7.84-1.83A11.93 11.93 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3Zm0 21.818a9.78 9.78 0 0 1-4.99-1.37l-.358-.213-4.653 1.087 1.108-4.533-.234-.372A9.78 9.78 0 0 1 6.182 15c0-5.415 4.404-9.818 9.819-9.818S25.818 9.585 25.818 15 21.415 24.818 16.001 24.818Zm5.373-7.34c-.294-.147-1.74-.859-2.01-.957-.27-.098-.467-.147-.663.147-.196.294-.76.957-.932 1.153-.171.196-.343.221-.637.074-.294-.147-1.242-.458-2.366-1.463-.875-.78-1.466-1.744-1.638-2.038-.171-.294-.018-.453.129-.6.132-.132.294-.343.441-.514.147-.171.196-.294.294-.49.098-.196.049-.368-.025-.515-.074-.147-.663-1.6-.909-2.19-.24-.577-.483-.499-.663-.508l-.564-.01c-.196 0-.515.074-.784.368-.27.294-1.03 1.007-1.03 2.456s1.055 2.848 1.202 3.044c.147.196 2.077 3.171 5.033 4.446.703.303 1.252.484 1.68.62.706.225 1.348.193 1.856.117.566-.085 1.74-.712 1.985-1.4.245-.688.245-1.278.171-1.4-.073-.123-.269-.196-.563-.343Z" />
      </svg>
    </a>
  );
}