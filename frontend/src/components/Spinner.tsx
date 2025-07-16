export default function Spinner() {
  return (
    <div role="status" className="flex items-center justify-center">
      <svg
        className="w-8 h-8 animate-spin text-primary"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
