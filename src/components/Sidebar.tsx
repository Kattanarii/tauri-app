import { useState } from "react"

export function Sidebar() {
    const [ show, setShow ] = useState(false)

    return <>
        <div className="sidebarIcon" onClick={() => setShow(true)}>
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div className="backdrop" onClick={() => setShow(false)}>
            <div className={`sidebar ${show ? 'show' : ''}`}>
                
            </div>    
        </div>
    </>
}