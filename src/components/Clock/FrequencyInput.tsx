import { useCallback, useEffect, useState } from "react"

export function FrequencyInput({ setFrequencyValue, frequencyValue }: { setFrequencyValue: React.Dispatch<React.SetStateAction<string>>, frequencyValue: string }) {
    const [ frequency, setFrequency ] = useState("")
    const [ selectedDays, setSelectedDays ] = useState<Set<string>>(new Set())

    const handleDayToggle = (day: string) => {
        setSelectedDays((prevSelected) => {
            const newSelected = new Set(prevSelected)

            if(selectedDays.has(day)) newSelected.delete(day)
            if(!selectedDays.has(day)) newSelected.add(day)

            return newSelected
        })
    }

    const updateState = useCallback(() => {
        if(frequency === "Custom") {
            const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            const sortedDays = Array.from(selectedDays).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
            setFrequencyValue(sortedDays.join(', '))
            return
        }
        setFrequencyValue(frequency)
    }, [frequency, selectedDays])

    useEffect(() => {
        updateState()
    }, [frequency, selectedDays, updateState])

    const innit = () => {
        if(frequencyValue === "Once" || frequencyValue === "Weekend") return setFrequency(frequencyValue)
        setFrequency("Custom")
        setSelectedDays(new Set(frequencyValue.split(", ")))
    }

    useEffect(() => {
        innit()
    }, [])

    return <>
        <div className="frequency-input">
            <label>Frequency</label>
            <p onClick={() => setFrequency("Once")} className={`${frequency === "Once" ? "selected" : ""}`}>Once</p>
            <p onClick={() => setFrequency("Weekend")} className={`${frequency === "Weekend" ? "selected" : ""}`}>Weekend</p>
            <p onClick={() => setFrequency("Custom")} className={`${frequency === "Custom" ? "selected" : ""}`}>Custom</p>
            {frequency === "Custom" && <div className="days">
                <p onClick={() => handleDayToggle("Mon")} className={`${selectedDays.has("Mon") ? "selected" : ""}`}>Mon</p>
                <p onClick={() => handleDayToggle("Tue")} className={`${selectedDays.has("Tue") ? "selected" : ""}`}>Tue</p>
                <p onClick={() => handleDayToggle("Wed")} className={`${selectedDays.has("Wed") ? "selected" : ""}`}>Wed</p>
                <p onClick={() => handleDayToggle("Thu")} className={`${selectedDays.has("Thu") ? "selected" : ""}`}>Thu</p>
                <p onClick={() => handleDayToggle("Fri")} className={`${selectedDays.has("Fri") ? "selected" : ""}`}>Fri</p>
                <p onClick={() => handleDayToggle("Sat")} className={`${selectedDays.has("Sat") ? "selected" : ""}`}>Sat</p>
                <p onClick={() => handleDayToggle("Sun")} className={`${selectedDays.has("Sun") ? "selected" : ""}`}>Sun</p>
            </div>}
        </div>
    </>
}