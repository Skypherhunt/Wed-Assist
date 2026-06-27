// A small decorative gold motif used to top sections.
export default function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className={className}
      width="120"
      height="24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 12h36M82 12h36"
        stroke="var(--accent)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M60 3c4 5 9 6 9 9s-5 4-9 9c-4-5-9-6-9-9s5-4 9-9Z"
        stroke="var(--accent)"
        strokeWidth="1.2"
      />
      <circle cx="60" cy="12" r="1.6" fill="var(--accent)" />
      <circle cx="44" cy="12" r="1.4" fill="var(--accent)" />
      <circle cx="76" cy="12" r="1.4" fill="var(--accent)" />
    </svg>
  );
}
