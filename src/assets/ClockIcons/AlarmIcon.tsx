export function AlarmIcon({ ...props }) {
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
          d="M3 5.5l2-2m16 2l-2-2m-7 5v4l2 2m6-2a8 8 0 11-16 0 8 8 0 0116 0z"
          stroke="#000"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }