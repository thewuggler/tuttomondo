export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <circle cx="17" cy="7" r="3.5" fill="white" />
    </svg>
  );
}
