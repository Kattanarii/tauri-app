import { convertFromRaw, convertToRaw, Editor, EditorState, RichUtils } from "draft-js"
import { GridElement } from "./GridElement"
import { useEffect, useState } from "react"
import { BoldIcon } from "../assets/BoldIcon"
import { ItalicIcon } from "../assets/ItalicIcon"
import { UnderlineIcon } from "../assets/UnderlineIcon"
import { ListIcon } from "../assets/ListIcon"
import { NumberedListIcon } from "../assets/NumberedListIcon"
import { StrikethroughIcon } from "../assets/StrikethroughIcon"
import Database from "@tauri-apps/plugin-sql"

export function Notepad({ id, dataToLoad }: { id: string, dataToLoad?: Note }) {
    const [ editorState, setEditorState ] = useState(() => EditorState.createEmpty())

    const toggleInlineStyle = (style: string) => {
        const newState = RichUtils.toggleInlineStyle(editorState, style)
        setEditorState(newState)
    }

    const toggleBlockType = (blockType: string) => {
        const newState = RichUtils.toggleBlockType(editorState, blockType)
        setEditorState(newState)
    }

    const saveNote = async () => {
        try {
            const db = await Database.load('sqlite:data.db')

            const rawContent = convertToRaw(editorState.getCurrentContent())
            const hasText = rawContent.blocks.some(block => block.text.trim() !== "")
            if(!hasText) return

            const [noteExists]: Note[] = await db.select("SELECT * FROM notes WHERE id LIKE $1", [id])

            if(noteExists) return await db.execute("UPDATE notes SET content = $1 WHERE id LIKE $2", [JSON.stringify(rawContent), id])
            
            await db.execute("INSERT INTO notes (id, content) VALUES($1, $2)", [id, JSON.stringify(rawContent)])
        } catch (error) {
            console.error("Failed to save note:", error)
        }
    }

    useEffect(() => {
        saveNote()
    }, [editorState])

    useEffect(() => {
        if(dataToLoad?.content) {
            const rawContent = JSON.parse(dataToLoad.content)
            const contentState = convertFromRaw(rawContent)
            const newEditorState = EditorState.createWithContent(contentState)
            setEditorState(newEditorState)
        }
    }, [])

    return <GridElement id={id} storedPosition={dataToLoad?.position} defaultSize="20 / 20 / span 45 / span 69" type="note">
        <div className="notepad">
            <div className="toolbar">
                <div>
                    <button onClick={() => toggleInlineStyle('BOLD')}><BoldIcon /></button>
                    <button onClick={() => toggleInlineStyle('ITALIC')}><ItalicIcon /></button>
                    <button onClick={() => toggleInlineStyle('UNDERLINE')}><UnderlineIcon /></button>
                    <button onClick={() => toggleInlineStyle('STRIKETHROUGH')}><StrikethroughIcon /></button>
                    <button onClick={() => toggleBlockType('ordered-list-item')}><NumberedListIcon /></button>
                    <button onClick={() => toggleBlockType('unordered-list-item')}><ListIcon /></button>
                </div>
                <div>
                    <button onClick={() => toggleBlockType('header-one')}>H1</button>
                    <button onClick={() => toggleBlockType('header-two')}>H2</button>
                    <button onClick={() => toggleBlockType('header-three')}>H3</button>
                    <button onClick={() => toggleBlockType('header-four')}>H4</button>
                    <button onClick={() => toggleBlockType('header-five')}>H5</button>
                    <button onClick={() => toggleBlockType('header-six')}>H6</button>
                </div>
            </div>
            <Editor editorState={editorState} onChange={setEditorState} />
        </div>
    </GridElement>
}