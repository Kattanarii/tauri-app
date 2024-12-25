import "./styles/style.scss"
import { Grid } from "./components/Grid"
import { Sidebar } from "./components/Sidebar"
import { useEffect } from "react"
import Database from '@tauri-apps/plugin-sql'

export function App() {

    const createDatabase = async () => {
        try {
            const db = await Database.load('sqlite:data.db')
            await db.execute(`CREATE TABLE IF NOT EXISTS notes (
                id varchar(10) NOT NULL, 
                content varchar(30), 
                position varchar(10), 
                PRIMARY KEY(id))`)
        } catch(error) {
            console.log("Error creating default config: ", error)
        }
    }

    useEffect(() => {
        createDatabase()
    }, [])

    return <>
        <Sidebar />
        <Grid/>
    </>
}