export function ExportIcon({ ...props }) {
    return (
      <svg
        fill="#000"
        width="1rem"
        height="1rem"
        viewBox="0 0 24 24"
        data-name="Flat Line"
        xmlns="http://www.w3.org/2000/svg"
        className="icon flat-line"
        {...props}
      >
        <g
          fill="none"
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <path d="M17 3L21 3 21 7" />
          <path data-name="primary" d="M11 13L21 3" />
          <path
            data-name="primary"
            d="M19 13.89V20a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h6.11"
          />
        </g>
      </svg>
    )
  }