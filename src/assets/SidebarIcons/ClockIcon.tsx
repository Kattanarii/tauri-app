export function ClockIcon({ ...props }) {
    return (
      <svg
        width="1rem"
        height="1rem"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M12 7v5l2.5-1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          stroke="#000"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }