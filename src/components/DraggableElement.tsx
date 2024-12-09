import { useRef, useState } from "react"

export function DraggableElement({ scale }: { scale: number }) {
    const [ position, setPosition ] = useState({ row: 2, col: 2 })
    const [ size, setSize ] = useState({ rowSpan: 7, colSpan: 12 })
    const elementRef = useRef<HTMLDivElement>(null) 
    const gridSize = 16 * 2
    
    const handleResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        const startX = e.clientX
        const startY = e.clientY

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX 
            const deltaY = e.clientY - startY

            elementRef.current?.classList.add('resizing')

            const newRowSpan = Math.max(1, Math.round((size.rowSpan * gridSize + deltaY / scale) / gridSize))
            const newColSpan = Math.max(1, Math.round((size.colSpan * gridSize + deltaX / scale) / gridSize)) 
            setSize({ rowSpan: newRowSpan, colSpan: newColSpan })
        }

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            elementRef.current?.classList.remove('resizing')
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

            const newRow = Math.round(Math.max(2, Math.round((position.row * gridSize + deltaY / scale) / gridSize)))
            const newCol = Math.round(Math.max(2, Math.round((position.col * gridSize + deltaX / scale) / gridSize)))
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

    return <>
        <div className="element" 
        ref={ elementRef }
        onMouseDown={(e) => e.stopPropagation()}
        style={{ 
            gridRow: `${position.row} / span ${size.rowSpan}`, 
            gridColumn: `${position.col} / span ${size.colSpan}`,
        }}>
            <div className="resize" onMouseDown={handleResize}></div>
            <div className="drag" onMouseDown={handleDrag}></div>
        </div>
    </>
}