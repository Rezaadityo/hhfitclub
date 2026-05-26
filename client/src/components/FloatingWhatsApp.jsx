import { FaWhatsapp } from "react-icons/fa";

const phoneNumber = "6281234567890";
const message = "Halo HH FIT CLUB, saya ingin bertanya...";

export default function FloatingWhatsApp() {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat WhatsApp HH FIT CLUB"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe5d]"
    >
      <FaWhatsapp size={30} />
    </a>
  );
}
