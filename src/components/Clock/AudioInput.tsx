import { open } from "@tauri-apps/plugin-dialog"
import { useEffect, useState } from "react"

export function AudioInput({ setFilePath, filePath }: { setFilePath: React.Dispatch<React.SetStateAction<string>>, filePath: string}) {
    const [ fileName, setFileName ] = useState('Default Ringtone')

    const handleSelectFile = async () => {
        try {
            const path = await open({ filters: [ { name: "Audio", extensions: [ "wav", "mp3", "ogg", "flac" ] } ] })
            if(!path) return setFilePath('dafault')
            setFilePath(path)

            const name = path.split("\\").pop()?.split(".")[0]
            if(!name) return
            setFileName(name)
        } catch(error) {
            console.log("Error: ", error)
        }
    }

    useEffect(() => {
        if(filePath) {
            const name = filePath.split("\\").pop()?.split(".")[0]

            if(!name) return
            if(name === "alarm-default") return setFileName("Default Ringtone")

            setFileName(name)
        }
    }, [])

    return <>
        <div className="audio-input">
            <label>Ringtone</label>
            <button onClick={handleSelectFile}>Select File</button>
            <p>{fileName.length > 28 ? fileName.substring(0, 25) + "..." : fileName}</p>
        </div>
    </>
}