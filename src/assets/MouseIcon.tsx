export function MouseIcon({ ...props }) {
    return (
      <svg
        width="1rem"
        height="1rem"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <g stroke="#000" strokeWidth={2.5}>
          <path d="M19 15a7 7 0 11-14 0V9a7 7 0 0114 0v2" strokeLinecap="round" />
          <path d="M10.5 8.5a1.5 1.5 0 013 0v2a1.5 1.5 0 01-3 0v-2z" />
          <path d="M12 2v5" strokeLinecap="round" />
        </g>
      </svg>
    )
  }