import "./styles/style.scss"
import { DraggableElement } from "./components/DraggableElement"
import { useEffect, useRef, useState } from "react"
import { Sidebar } from "./components/Sidebar"

export function App() {
    const [ scale, setScale ] = useState(1)
    const [ position, setPosition ] = useState({ x: 0, y: 0 })
    const [ size, setSize ] = useState({ width: 0, height: 0 })
    const gridRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

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
        if (e.deltaY > 0) return setScale(prevScale => Math.max(0.5, prevScale - 0.1))
        setScale(prevScale => Math.min(2, prevScale + 0.1))
    }

    const handleGridSize = () => {
        if (containerRef.current && gridRef.current) {
            const newWidth = containerRef.current.offsetWidth / scale - position.x
            const newHeight = containerRef.current.offsetHeight / scale - position.y

            if(size.width < newWidth) setSize(prev => ({ ...prev, width: newWidth }))
            if(size.height < newHeight) setSize(prev => ({ ...prev, height: newHeight }))
        }
    }

    useEffect(() => {
        handleGridSize()
    }, [scale, position])

    return <>
        <div className="container" ref={ containerRef }>
            <Sidebar />
            <div
                className="grid"
                ref={ gridRef }
                onMouseDown={handleGridDrag}
                onWheel={handleZoom}
                style={{ 
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`
                }}>
                <DraggableElement scale={scale}/>
            </div>
        </div>
    </>
}