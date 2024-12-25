import { useEffect, useRef, useState } from "react"
import { Notepad } from "./Notepad"
import { useMainStore } from "../store/useMainStore"
import genUid from "light-uid"
import { NoteIcon } from "../assets/NoteIcon"
import { ExportIcon } from "../assets/ExportIcon"
import { ImportIcon } from "../assets/ImportIcon"
import { open, save } from "@tauri-apps/plugin-dialog"
import { BaseDirectory, copyFile } from "@tauri-apps/plugin-fs"

export function Sidebar() {
    const [ showSidebar, setShowSidebar ] = useState(false)
    const sidebarRef = useRef(null)
    const iconRef = useRef(null)
    const addGridElement = useMainStore(state => state.addGridElement)

    useEffect(() => {
        window.addEventListener('click', (e) => { if(e.target !== iconRef.current) setShowSidebar(false) })
        return () => window.removeEventListener('click', (e) => { if(e.target !== iconRef.current) setShowSidebar(false) })
    }, [])

    const handleNewNote = async () => {
        addGridElement(<Notepad id={genUid()}/>)
    }

    const handleExport = async () => {
        const path = await save({ filters: [{ name: "database", extensions: ['db', 'sqlite'] }], defaultPath: "data.db" })
        if(!path) return

        await copyFile('data.db', path, { fromPathBaseDir: BaseDirectory.AppData })
    }

    const handleImport = async () => {
        const path = await open({ filters: [{ name: "database", extensions: ['db', 'sqlite'] }] })
        if(!path) return

        await copyFile(path, 'data.db', { toPathBaseDir: BaseDirectory.AppData })
        window.location.reload()
    }

    return <>   
        <div className="sidebar-icon" onClick={() => setShowSidebar(!showSidebar)} ref={ iconRef }>
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div className={`sidebar ${showSidebar ? 'show' : ''}`} onClick={(e) => e.stopPropagation()} ref={ sidebarRef }>
            <button onClick={handleNewNote}><span><NoteIcon /></span> New note</button>
            <div className="import-export">
                <button onClick={handleExport}><span><ExportIcon /></span>Export</button>
                <button onClick={handleImport}><span><ImportIcon /></span>Import</button>
            </div>
        </div>    
    </>
}