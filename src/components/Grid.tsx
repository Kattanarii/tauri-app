import { Fragment, useEffect, useRef, useState } from "react"
import { useMainStore } from "../store/useMainStore"
import { Notepad } from "./Notepad"
import Database from "@tauri-apps/plugin-sql"

export function Grid() {
    const [ scale, setScale ] = useState(1)
    const [ position, setPosition ] = useState({ x: 0, y: 0 })
    const gridRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const setGridScale = useMainStore(state => state.setGridScale)
    const setGridSize = useMainStore(state => state.setGridSize)
    const gridSize = useMainStore(state => state.gridSize)
    const gridElements = useMainStore(state => state.gridElements)
    const addGridElement = useMainStore(state => state.addGridElement)
    const loadedElements = useRef<Set<string>>(new Set())

    const handleGridDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        const startX = e.clientX
        const startY = e.clientY

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX
            const deltaY = e.clientY - startY

            const newX = position.x + deltaX / scale 
            const newY = position.y + deltaY / scale 
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
        if (e.deltaY > 0) return setScale(prevScale => Math.max(0.5, prevScale - 0.1))
        setScale(prevScale => Math.min(2, prevScale + 0.1))
    }

    const handleGridSize = () => {
        if (containerRef.current && gridRef.current) {
            const newWidth = containerRef.current.offsetWidth / scale - position.x
            const newHeight = containerRef.current.offsetHeight / scale - position.y

            if (gridSize.width < newWidth) setGridSize({ width: newWidth })
            if (gridSize.height < newHeight) setGridSize({ height: newHeight })
        }
    }

    useEffect(() => {
        setGridScale(scale)
        handleGridSize()
    }, [scale, position])

    const loadData = async () => {
        try {
            const db = await Database.load('sqlite:data.db')

            const storedNotes: Note[] = await db.select("SELECT * FROM notes")

            storedNotes.forEach((note, index) => {
                if(loadedElements.current.has(note.id)) return
                loadedElements.current.add(note.id)

                addGridElement(<Notepad id={note.id!} dataToLoad={storedNotes[index]}/>)
            })
        } catch (error) {
            console.error("Failed to load note:", error)
        }
    }

    useEffect(() => {
        loadData()
        window.addEventListener('resize', handleGridSize)
        return () => window.removeEventListener('resize', handleGridSize)
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
                    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`
                }}>
                {gridElements.map((element, index) => (
                    <Fragment key={index}>{element}</Fragment>
                ))}
            </div>
            <div className="scale">{(scale * 100).toFixed(0)} %</div>
        </div>
    </>
}