import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"
import { GridElement } from "../GridElement"
import { Stopwatch } from "./Stopwatch"
import { Alarms } from "./Alarms"
import { Timer } from "./Timer"
import { TimerIcon } from "../../assets/ClockIcons/TimerIcon"
import { StopwatchIcon } from "../../assets/ClockIcons/StopwatchIcon"
import { AlarmIcon } from "../../assets/ClockIcons/AlarmIcon"
import { invoke } from "@tauri-apps/api/core"
import Database from "@tauri-apps/plugin-sql"
import { useDebounce } from "../../hooks/useDebounce"

export function Clock({ id, dataToLoad }: { id: string, dataToLoad?: Clock }) {
    const [ activeElement, setActiveElement ] = useState("Timer")
    const [ alarmVolume, setAlarmVolume ] = useState(100)
    const [ data, setData ] = useState<{ timerRingtone: string, alarms: Alarm[] }>({ timerRingtone: '', alarms: [] })
    let db: Database

    const updateData = (newData: Partial<{ timerRingtone?: string, alarms?: Alarm[] }>) => setData((prev) => ({ ...prev, ...newData }))

    const elements = useMemo(() => ({ 
        Timer: <Timer updateData={updateData} clockId={id} storedRingtone={dataToLoad?.timerRingtone}/>, 
        Stopwatch: <Stopwatch />, 
        Alarms: <Alarms updateData={updateData} storedAlarms={dataToLoad?.alarms} clockId={id}/> 
    }), [])

    const handleVolume = async (e: ChangeEvent<HTMLInputElement>) => {
        const volume = Number(e.target.value)
        if(volume < 0 || volume > 200) return
        setAlarmVolume(volume)
        try {
            await invoke("set_volume", { volume: volume / 100 })
        } catch(error) {    
            console.log("Error: ", error)
        }
    }

    const saveClockData = useDebounce(useCallback(async () => {
        try {
            if(!db) db = await Database.load('sqlite:data.db')

            const [clockExists]: Clock[] = await db.select("SELECT * FROM clocks WHERE id LIKE $1", [id])

            if(clockExists) return await db.execute("UPDATE clocks SET volume = $1, timerRingtone = $2, activeElement = $3 WHERE id LIKE $4", 
                [alarmVolume, data.timerRingtone, activeElement, id])

            await db.execute("INSERT INTO clocks (id, volume, timerRingtone, activeElement) VALUES($1, $2, $3, $4)", [id, alarmVolume, data.timerRingtone, activeElement])
        } catch (error) {
            console.error("Failed to save clock: ", error)
        }
    }, [alarmVolume, data.timerRingtone, activeElement]))

    useEffect(() => {
        saveClockData()
    }, [alarmVolume, data.timerRingtone, activeElement, saveClockData])

    const saveAlarmData = useDebounce(useCallback(async (alarm: Alarm) => {
        try {
            if(!db) db = await Database.load('sqlite:data.db')

            const [alarmExists]: Alarm[] = await db.select("SELECT * FROM alarms WHERE id LIKE $1", [alarm.id])

            if(alarmExists) return await db.execute("UPDATE alarms SET label = $1, time = $2, postponedTime = $3, active = $4, frequency = $5, ringtone = $6 WHERE id LIKE $7", 
                [alarm.label, alarm.time, alarm.postponedTime, alarm.active, alarm.frequency, alarm.ringtone, alarm.id])
            
            await db.execute("INSERT INTO alarms (id, clockId, label, time, postponedTime, active, frequency, ringtone) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
                [alarm.id, id, alarm.label, alarm.time, alarm.postponedTime, alarm.active, alarm.frequency, alarm.ringtone])
        } catch(error) {
            console.log("Failed to save alarm: ", error)
        }
    }, [data.alarms]))
 
    useEffect(() => { 
        data.alarms.forEach(alarm => saveAlarmData(alarm)) 
    }, [data.alarms, saveAlarmData])

    useEffect(() => {
        if(dataToLoad) {
            setAlarmVolume(dataToLoad.volume ?? 100)
            setActiveElement(dataToLoad.activeElement ?? "Timer")
        }
    }, [])

    return <GridElement id={id} type="clock" defaultSize="20 / 20 / span 45 / span 69" storedPosition={dataToLoad?.position}>
        <div className="clock">
            <div className="nav">
                <button onClick={() => setActiveElement("Timer")} className={activeElement === "Timer" ? "active" : ""}><span><TimerIcon /></span></button>
                <button onClick={() => setActiveElement("Stopwatch")} className={activeElement === "Stopwatch" ? "active" : ""}><span><StopwatchIcon /></span></button>
                <button onClick={() => setActiveElement("Alarms")} className={activeElement === "Alarms" ? "active" : ""}><span><AlarmIcon /></span></button>
            </div>
            {Object.entries(elements).map(([key, component]) => (
                <div key={key} style={{ display: key === activeElement ? "block" : "none", width: "100%", height: "100%" }}>
                    {component}
                </div>
            ))}
            <div className="volume-input">
                <input type="range" value={alarmVolume} onChange={handleVolume} min={0} max={200} />
                <p>{alarmVolume} %</p>
            </div>
        </div>
    </GridElement>
}