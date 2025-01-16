import { BaseSyntheticEvent, useEffect, useRef, useState } from "react"
import { useMainStore } from "../store/useMainStore"
import Database from "@tauri-apps/plugin-sql"

export function GridElement({ children, id, storedPosition, defaultSize, type }: { children: React.ReactNode, id: string, storedPosition?: string, defaultSize: string, type: string }) {
    const [ position, setPosition ] = useState({ row: 0, col: 0 })
    const [ size, setSize ] = useState({ rowSpan: 0, colSpan: 0 })
    const scale = useMainStore(state => state.gridScale)
    const setGridSize = useMainStore(state => state.setGridSize)
    const gridSize = useMainStore(state => state.gridSize)
    const elementRef = useRef<HTMLDivElement>(null) 
    const gridCellSize = 16 * 0.5
    const [ loaded, setLoaded ] = useState(false)
    const setAutoClickerLimit = useMainStore(state => state.setAutoClickerLimit)
    const removeGridElement = useMainStore(state => state.removeGridElement)

    const handleResizeBoth = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        const startX = e.clientX
        const startY = e.clientY

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX 
            const deltaY = e.clientY - startY

            elementRef.current?.classList.add('resize-both')

            let newRowSpan = 1
            let newColSpan = 1

            if(type === 'clicker') {
                const data = defaultSize.match(/\d+/g)?.map(Number) as number[]

                newRowSpan = Math.max(data[2], Math.round((size.rowSpan * gridCellSize + deltaY / scale) / gridCellSize))
                newColSpan = Math.max(data[3], Math.round((size.colSpan * gridCellSize + deltaX / scale) / gridCellSize)) 
            }
            if(type === 'note') {
                newRowSpan = Math.max(32, Math.round((size.rowSpan * gridCellSize + deltaY / scale) / gridCellSize))
                newColSpan = Math.max(32, Math.round((size.colSpan * gridCellSize + deltaX / scale) / gridCellSize)) 
            }
            
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

            let newColSpan = 1
            if(type === 'clicker') {
                const data = defaultSize.match(/\d+/g)?.map(Number) as number[]

                newColSpan = Math.max(data[3], Math.round((size.colSpan * gridCellSize + deltaX / scale) / gridCellSize))
            }
            if(type === 'note') {
                newColSpan = Math.max(32, Math.round((size.colSpan * gridCellSize + deltaX / scale) / gridCellSize))
            }
            
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

            let newRowSpan = 1
            if(type === 'clicker') {
                const data = defaultSize.match(/\d+/g)?.map(Number) as number[]

                newRowSpan = Math.max(data[2], Math.round((size.rowSpan * gridCellSize + deltaY / scale) / gridCellSize)) 
            }
            if(type === 'note') {
                newRowSpan = Math.max(32, Math.round((size.rowSpan * gridCellSize + deltaY / scale) / gridCellSize)) 
            }

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

            if(type === 'note') {
                const [noteExists]: Note[] = await db.select("SELECT * FROM notes WHERE id LIKE $1", [id])
    
                const newPosition = `${position.row} / ${position.col} / span ${size.rowSpan} / span ${size.colSpan}` 
                
                if(noteExists) return await db.execute("UPDATE notes SET position = $1 WHERE id LIKE $2", [newPosition, id])
    
                await db.execute("INSERT INTO notes (id, position) VALUES($1, $2)", [id, newPosition])
            }

            if(type === 'clicker') {
                const [clickerExists]: AutoClicker[] = await db.select("SELECT * FROM auto_clicker WHERE id LIKE $1", [id])
    
                const newPosition = `${position.row} / ${position.col} / span ${size.rowSpan} / span ${size.colSpan}` 
                
                if(clickerExists) return await db.execute("UPDATE auto_clicker SET position = $1 WHERE id LIKE $2", [newPosition, id])
    
                await db.execute("INSERT INTO auto_clicker (id, position) VALUES($1, $2)", [id, newPosition])
            }
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
        if(!data) {
            const defaultData = defaultSize.match(/\d+/g)?.map(Number) as number[]
            setPosition({ row: defaultData[0], col: defaultData[1] })
            setSize({ rowSpan: defaultData[2], colSpan: defaultData[3] })  
            setLoaded(true)
            return
        }

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

    const handleClose = async () => {
        removeGridElement(id)
        if(type === 'note') {
            try {
                const db = await Database.load("sqlite:data.db")
    
                await db.execute("DELETE FROM notes WHERE id LIKE $1", [id])
            } catch(error) {
                console.log("Failed to delete note: ", error)
            }
        }
        if(type === 'clicker') {
            setAutoClickerLimit(1)
            try {
                const db = await Database.load("sqlite:data.db")

                await db.execute("DELETE FROM auto_clicker WHERE id LIKE $1", [id])
            } catch(error) {
                console.log("Failed to delete clicker: ", error)
            }
        }
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
            <span className="close" onClick={handleClose}></span>
            { children }
            <div className="resize-horizontal" onMouseDown={handleResizeHorizontal}></div>
            <div className="resize-both" onMouseDown={handleResizeBoth}></div>
            <div className="resize-vertical" onMouseDown={handleResizeVertical}></div>
        </div>
    </>
}