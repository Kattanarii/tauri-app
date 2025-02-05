import { useEffect, useState } from "react"

export function Stopwatch() {
    const [ miliseconds, setMiliseconds ] = useState(0)
    const [ isRunning, setIsRunning ] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout

        if(isRunning) interval = setInterval(() => setMiliseconds(prev => prev + 1), 10)
        
        return () => clearInterval(interval)
    }, [isRunning])

    const formatTime = (totalMiliseconds: number) => {
        const minutes = Math.floor(totalMiliseconds / 6000)
        const seconds = Math.floor((totalMiliseconds % 6000) / 100)
        const miliseconds = totalMiliseconds % 100

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(miliseconds).padStart(2, '0')}`
    }

    return <>
        <div className="stopwatch">
            <p className="time">{formatTime(miliseconds)}</p>
            <div className="controls">
                <button onClick={() => setIsRunning(true)}>Start</button>
                <button onClick={() => setIsRunning(false)}>Stop</button>
                <button onClick={() => {
                    setIsRunning(false)
                    setMiliseconds(0)
                }}>Reset</button>
            </div>
        </div>
    </>
}