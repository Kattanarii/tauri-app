import { useCallback, useEffect, useRef, useState } from "react"
import { useMainStore } from "../store/useMainStore"
import { Notepad } from "./Notepad"
import Database from "@tauri-apps/plugin-sql"
import { AutoClicker } from "./AutoClicker"
import { Clock } from "./Clock/Clock"
import * as path from '@tauri-apps/api/path'
import { invoke } from "@tauri-apps/api/core"

export function Grid() {
    const [ position, setPosition ] = useState({ x: 0, y: 0 })
    const gridRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const gridScale = useMainStore(state => state.gridScale)
    const setGridScale = useMainStore(state => state.setGridScale)
    const setGridSize = useMainStore(state => state.setGridSize)
    const gridSize = useMainStore(state => state.gridSize)
    const gridElements = useMainStore(state => state.gridElements)
    const addGridElement = useMainStore(state => state.addGridElement)
    const loadedElements = useRef<Set<string>>(new Set())
    let db: Database

    const handleGridDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        const startX = e.clientX
        const startY = e.clientY

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX
            const deltaY = e.clientY - startY

            const newX = position.x + deltaX / gridScale 
            const newY = position.y + deltaY / gridScale 
            setPosition({ x: newX < 0 ? newX : 0, y: newY < 0 ? newY : 0 })
        }

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
    }

    const handleZoom = (e: React.WheelEvent) => {
        if(!e.ctrlKey) return
        if (e.deltaY > 0) return setGridScale(Math.max(0.5, gridScale - 0.1))
        setGridScale(Math.min(2, gridScale + 0.1))
    }

    const handleGridSize = useCallback(() => {
        if (containerRef.current && gridRef.current) {
            const newWidth = containerRef.current.offsetWidth / gridScale - position.x
            const newHeight = containerRef.current.offsetHeight / gridScale - position.y

            if (gridSize.width < newWidth) setGridSize({ width: newWidth })
            if (gridSize.height < newHeight) setGridSize({ height: newHeight })
        }
    }, [gridSize, position])

    useEffect(() => {
        handleGridSize()
        window.addEventListener('resize', handleGridSize)
        return () => window.removeEventListener('resize', handleGridSize)
    }, [gridScale, position, handleGridSize])

    const loadData = async () => {
        try {
            await invoke("add_default_alarm", { dst: await path.appDataDir() + '/alarm-default.mp3' })

            if(!db) db = await Database.load('sqlite:data.db')

            await db.execute(`CREATE TABLE IF NOT EXISTS notes (
                id TEXT NOT NULL, 
                content TEXT, 
                position TEXT, 
                PRIMARY KEY(id))`)
            await db.execute(`CREATE TABLE IF NOT EXISTS autoClicker (
                id TEXT NOT NULL, 
                mouseButton TEXT, 
                clickInterval INTEGER, 
                clickType TEXT, 
                triggerKey TEXT, 
                position TEXT, 
                PRIMARY KEY(id))`)
            await db.execute(`CREATE TABLE IF NOT EXISTS clocks (
                id TEXT NOT NULL,
                volume INTEGER,
                timerRingtone TEXT,
                activeElement TEXT,
                position TEXT,
                PRIMARY KEY(id))`)
            await db.execute(`CREATE TABLE IF NOT EXISTS alarms (
                id TEXT NOT NULL,
                clockId TEXT NOT NULL,
                label TEXT,
                time TEXT,
                postponedTime TEXT,
                active INTEGER,
                frequency TEXT,
                ringtone TEXT,
                PRIMARY KEY(id),
                FOREIGN KEY(clockId) REFERENCES clocks(id) ON DELETE CASCADE)`)

            const storedNotes: Note[] = await db.select("SELECT * FROM notes")
            storedNotes.forEach(note => {
                if(loadedElements.current.has(note.id)) return
                loadedElements.current.add(note.id)
                
                addGridElement(<Notepad id={note.id} dataToLoad={note} key={note.id}/>)
            })
            
            const [storedClicker]: AutoClicker[] = await db.select("SELECT * FROM autoClicker")
            if(storedClicker) {
                if(loadedElements.current.has(storedClicker.id)) return
                loadedElements.current.add(storedClicker.id)
                
                addGridElement(<AutoClicker id={storedClicker.id} dataToLoad={storedClicker} key={storedClicker.id} />)
            }

            const storedClocks: Clock[] = await db.select("SELECT * FROM clocks")
            await Promise.all(storedClocks.map(async (clock) => {
                if(loadedElements.current.has(clock.id)) return
                loadedElements.current.add(clock.id)

                const storedAlarms: Alarm[] = await db?.select("SELECT * FROM alarms WHERE clockId LIKE $1", [clock.id]) || []
                storedAlarms.map(alarm => alarm.active === "false" ? alarm.active = false : alarm.active = true)

                const data = { ...clock, alarms: storedAlarms }
                
                addGridElement(<Clock id={clock.id} key={clock.id} dataToLoad={data}/>)
            }))
        } catch (error) {
            console.error("Failed to load data:", error)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    return <>
        <div className="main-container" ref={ containerRef }>
            <div
                className="grid"
                ref={ gridRef }
                onMouseDown={handleGridDrag}
                onWheel={handleZoom}
                style={{ 
                    width: `${gridSize.width}px`,
                    height: `${gridSize.height}px`,
                    transform: `scale(${gridScale}) translate(${position.x}px, ${position.y}px)`
                }}>
                <>{...gridElements}</>
            </div>
            <div className="scale">{(gridScale * 100).toFixed(0)} %</div>
        </div>
    </>
}