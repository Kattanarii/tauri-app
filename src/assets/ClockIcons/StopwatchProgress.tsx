export function StopwatchProgress({ progress = 0, ...props }: { progress: number }) {
    const radius = 50
    const circumference = 2 * Math.PI * radius 
  
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
      <svg 
        viewBox="-5 -5 110 110" 
        xmlns="http://www.w3.org/2000/svg" 
        width="12rem" 
        height="12rem" 
        {...props}>
            <circle cx={50} cy={50} r={radius}
            stroke="white" 
            strokeWidth="0.3rem"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-180 50 50)"
            fill="none"/>
      </svg>
    )
  }