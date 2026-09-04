export default function WhatsAppBubble() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

  if (!whatsappNumber) return null;

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <a
      href={`https://wa.me/${cleanNumber}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg hover:bg-green-600"
    >
      💬
    </a>
  );
}