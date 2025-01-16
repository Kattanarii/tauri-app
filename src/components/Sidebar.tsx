import { useEffect, useRef, useState } from "react"
import { Notepad } from "./Notepad"
import { useMainStore } from "../store/useMainStore"
import genUid from "light-uid"
import { NoteIcon } from "../assets/NoteIcon"
import { ExportIcon } from "../assets/ExportIcon"
import { ImportIcon } from "../assets/ImportIcon"
import { open, save } from "@tauri-apps/plugin-dialog"
import { BaseDirectory, copyFile } from "@tauri-apps/plugin-fs"
import { AutoClicker } from "./AutoClicker"
import { MouseIcon } from "../assets/MouseIcon"
import Database from "@tauri-apps/plugin-sql"
import { ClearIcon } from "../assets/ClearIcon"

export function Sidebar() {
    const [ showSidebar, setShowSidebar ] = useState(false)
    const sidebarRef = useRef(null)
    const iconRef = useRef(null)
    const addGridElement = useMainStore(state => state.addGridElement)
    const autoClickerLimit = useMainStore(state => state.autoClickerLimit)
    const setAutoClickerLimit = useMainStore(state => state.setAutoClickerLimit)
    const clearGrid = useMainStore(state => state.clearGrid)

    const handleClickOutside = (e: MouseEvent) => {
        if(e.target !== iconRef.current) setShowSidebar(false)
    }

    useEffect(() => {
        window.addEventListener('click', handleClickOutside)
        return () => window.removeEventListener('click', handleClickOutside)
    }, [])

    const handleNewNote = async () => {
        const uId = genUid()
        addGridElement(<Notepad id={uId} key={uId}/>)
        setShowSidebar(false)
    }

    const handleNewAutoClicker = async () => {
        if(!autoClickerLimit) return

        const uId = genUid()
        addGridElement(<AutoClicker id={uId} key={uId}/>)
        setAutoClickerLimit(0)
        setShowSidebar(false)
    }

    const handleExport = async () => {
        const path = await save({ filters: [{ name: "database", extensions: ['db', 'sqlite'] }], defaultPath: "data.db" })
        if(!path) return

        await copyFile('data.db', path, { fromPathBaseDir: BaseDirectory.AppData })
        setShowSidebar(false)
    }

    const handleImport = async () => {
        const path = await open({ filters: [{ name: "database", extensions: ['db', 'sqlite'] }] })
        if(!path) return

        await copyFile(path, 'data.db', { toPathBaseDir: BaseDirectory.AppData })
        window.location.reload()
    }

    const handleClear = async () => {
        clearGrid()

        try {
            const db = await Database.load("sqlite:data.db")

            await db.execute("TRUNCATE TABLE notes")
            await db.execute("TRUNCATE TABLE auto_clicker")
        } catch(error) {
            console.log(error)
        }
    }

    return <>   
        <div className="sidebar-icon" onClick={() => setShowSidebar(true)} ref={ iconRef }>
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div className={`sidebar ${showSidebar ? 'show' : ''}`} onClick={(e) => e.stopPropagation()} ref={ sidebarRef }>
            <button onClick={handleNewNote}><span><NoteIcon /></span> New note</button>
            <button onClick={handleNewAutoClicker}><span><MouseIcon /></span>Auto clicker</button>
            <button onClick={handleClear} className="clear"><span><ClearIcon /></span>Clear grid</button>
            <div className="import-export">
                <button onClick={handleExport}><span><ExportIcon /></span>Export</button>
                <button onClick={handleImport}><span><ImportIcon /></span>Import</button>
            </div>
        </div>    
    </>
}