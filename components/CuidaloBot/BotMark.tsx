export function BotMark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M12 2.5 4.5 5.3v6.1c0 4.6 3.1 8.6 7.5 10.1 4.4-1.5 7.5-5.5 7.5-10.1V5.3L12 2.5Z" fill="currentColor" opacity="0.25" />
      <path
        d="M12 2.5 4.5 5.3v6.1c0 4.6 3.1 8.6 7.5 10.1 4.4-1.5 7.5-5.5 7.5-10.1V5.3L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="9.3" cy="9.6" r="1.1" fill="currentColor" />
      <circle cx="14.7" cy="9.6" r="1.1" fill="currentColor" />
      <circle cx="7.9" cy="12.3" r="1" fill="currentColor" />
      <circle cx="16.1" cy="12.3" r="1" fill="currentColor" />
      <path d="M12 12.2c-1.6 0-2.9 1.4-2.9 2.7 0 1 .8 1.5 1.6 1.5.6 0 .9-.3 1.3-.3s.7.3 1.3.3c.8 0 1.6-.5 1.6-1.5 0-1.3-1.3-2.7-2.9-2.7Z" fill="currentColor" />
    </svg>
  );
}

export function BotAvatar({ px, icon }: { px: number; icon: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white" style={{ width: px, height: px }}>
      <BotMark size={icon} />
    </span>
  );
}
