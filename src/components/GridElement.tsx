import { BaseSyntheticEvent, useEffect, useRef, useState } from "react"
import { useMainStore } from "../store/useMainStore"
import Database from "@tauri-apps/plugin-sql"

export function GridElement({ children, id, storedPosition }: { children: React.ReactNode, id: string, storedPosition?: string }) {
    const [ position, setPosition ] = useState({ row: 20, col: 20 })
    const [ size, setSize ] = useState({ rowSpan: 45, colSpan: 69 })
    const scale = useMainStore(state => state.gridScale)
    const setGridSize = useMainStore(state => state.setGridSize)
    const gridSize = useMainStore(state => state.gridSize)
    const elementRef = useRef<HTMLDivElement>(null) 
    const gridCellSize = 16 * 0.5
    const [ loaded, setLoaded ] = useState(false)

    const handleResizeBoth = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        const startX = e.clientX
        const startY = e.clientY

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX 
            const deltaY = e.clientY - startY

            elementRef.current?.classList.add('resize-both')

            const newRowSpan = Math.max(1, Math.round((size.rowSpan * gridCellSize + deltaY / scale) / gridCellSize))
            const newColSpan = Math.max(1, Math.round((size.colSpan * gridCellSize + deltaX / scale) / gridCellSize)) 
            setSize({ rowSpan: newRowSpan, colSpan: newColSpan })
        }

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            elementRef.current?.classList.remove('resize-both')
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
    }

    const handleResizeHorizontal = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        const startX = e.clientX

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX 

            elementRef.current?.classList.add('resize-horizontal')

            const newColSpan = Math.max(1, Math.round((size.colSpan * gridCellSize + deltaX / scale) / gridCellSize)) 
            setSize(prev => ({ ...prev, colSpan: newColSpan }))
        }

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            elementRef.current?.classList.remove('resize-horizontal')
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
    }

    const handleResizeVertical = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        const startY = e.clientY

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startY

            elementRef.current?.classList.add('resize-vertical')

            const newRowSpan = Math.max(1, Math.round((size.rowSpan * gridCellSize + deltaY / scale) / gridCellSize)) 
            setSize(prev => ({ ...prev, rowSpan: newRowSpan }))
        }

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            elementRef.current?.classList.remove('resize-vertical')
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
    }

    const handleDrag = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => { 
        e.preventDefault()
        const startX = e.clientX
        const startY = e.clientY

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX 
            const deltaY = e.clientY - startY

            elementRef.current?.classList.add('dragging')

            const newRow = Math.round(Math.max(2, Math.round((position.row * gridCellSize + deltaY / scale) / gridCellSize)))
            const newCol = Math.round(Math.max(2, Math.round((position.col * gridCellSize + deltaX / scale) / gridCellSize)))
            setPosition({ row: newRow, col: newCol})
        }

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            elementRef.current?.classList.remove('dragging')
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
    }

    const saveData = async () => {
        if(!loaded) return
        try {
            const db = await Database.load('sqlite:data.db')

            const [noteExists]: Note[] = await db.select("SELECT * FROM notes WHERE id LIKE $1", [id])

            const newPosition = `${position.row} / ${position.col} / span ${size.rowSpan} / span ${size.colSpan}` 
            
            if(noteExists) return await db.execute("UPDATE notes SET position = $1 WHERE id LIKE $2", [newPosition, id])

            await db.execute("INSERT INTO notes (id, position) VALUES($1, $2)", [id, newPosition])
        } catch (error) {
            console.error("Failed to save data:", error)
        }
    }

    const handleGridSize = () => {
        const newWidth = (position.col + size.colSpan) * gridCellSize
        const newHeight = (position.row + size.rowSpan) * gridCellSize

        if (gridSize.width < newWidth) setGridSize({ width: newWidth })
        if (gridSize.height < newHeight) setGridSize({ height: newHeight })
    }

    useEffect(() => {
        saveData()
        handleGridSize()
    }, [position, size])

    useEffect(() => {
        const data = storedPosition?.match(/\d+/g)?.map(Number)
        if(!data) return setLoaded(true)

        setPosition({ row: data[0], col: data[1] })
        setSize({ rowSpan: data[2], colSpan: data[3] })       
        setLoaded(true) 
    }, [])

    const handleHierarchy = (e: BaseSyntheticEvent) => {
        const parent = document.querySelector('.grid')
        const child = e.target.closest('.element')
        if (!parent || !child || parent.lastChild === child) return

        parent.appendChild(child)
    }

    return <>
        <div className="element"
        ref={ elementRef }
        onMouseDown={(e) => {
            e.stopPropagation()
            handleHierarchy(e)
        }}
        style={{ 
            gridRow: `${position.row} / span ${size.rowSpan}`, 
            gridColumn: `${position.col} / span ${size.colSpan}`,
        }}>
            <div className="drag" onMouseDown={handleDrag}></div>
            { children }
            <div className="resize-horizontal" onMouseDown={handleResizeHorizontal}></div>
            <div className="resize-both" onMouseDown={handleResizeBoth}></div>
            <div className="resize-vertical" onMouseDown={handleResizeVertical}></div>
        </div>
    </>
}