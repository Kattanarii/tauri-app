export function NoteIcon({ ...props }) {
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
          d="M13 20H7.197c-1.118 0-1.678 0-2.105-.218a2 2 0 01-.874-.874C4 18.48 4 17.92 4 16.8V7.2c0-1.12 0-1.68.218-2.108.192-.377.497-.682.874-.874C5.52 4 6.08 4 7.2 4h9.6c1.12 0 1.68 0 2.107.218.377.192.683.497.875.874.218.427.218.987.218 2.105V13m-7 7c.286-.003.466-.014.639-.055.204-.05.399-.13.578-.24.202-.124.375-.296.72-.642l4.126-4.125c.346-.346.518-.52.642-.721.11-.18.19-.375.24-.579.04-.172.051-.352.054-.638M13 20v-5.4c0-.56 0-.84.109-1.054a1 1 0 01.437-.437C13.76 13 14.04 13 14.6 13H20"
          stroke="#000"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }