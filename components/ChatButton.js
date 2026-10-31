// TODO: replace href with the studio's WhatsApp link, e.g. https://wa.me/91XXXXXXXXXX
export default function ChatButton() {
  return (
    <a className="chat" href="#contact" aria-label="Chat with us">
      <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
        <path d="M3 4.5A2.5 2.5 0 0 1 5.5 2h9A2.5 2.5 0 0 1 17 4.5v6a2.5 2.5 0 0 1-2.5 2.5H9l-4 3.2V13h0A2.5 2.5 0 0 1 3 10.5v-6Z" />
        <path d="M19 8h.5A1.5 1.5 0 0 1 21 9.5v6a1.5 1.5 0 0 1-1.5 1.5H19v3l-3.8-3H11a1.5 1.5 0 0 1-1.5-1.5V15h5a4.5 4.5 0 0 0 4.5-4.5V8Z" opacity=".85" />
      </svg>
    </a>
  );
}
