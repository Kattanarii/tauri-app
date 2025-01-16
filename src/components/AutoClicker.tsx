import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { GridElement } from './GridElement'
import { ArrowIcon } from '../assets/ArrowIcon'
import Database from '@tauri-apps/plugin-sql'
import { listen } from '@tauri-apps/api/event'

export function AutoClicker({ id, dataToLoad }: { id: string, dataToLoad?: AutoClicker }) {
    const [ triggerKey, setTriggerKey ] = useState("")
    const [ mouseButton, setMouseButton ] = useState("")
    const [ clickType, setClickType ] = useState("")
    const [ clickInterval, setClickInterval ] = useState(0)
    const [ clickerActive, setClickerActive ] = useState(false)
    const [ buttonDropdownVisible, setButtonDropdownVisible ] = useState(false)
    const [ typeDropdownVisible, setTypeDropdownVisible ] = useState(false)
    const [ listeningToKey, setListeningToKey ] = useState(false)
    const clicker = useRef<HTMLDivElement>(null)
    const buttonDropdown = useRef<HTMLDivElement>(null)
    const typeDropdown = useRef<HTMLDivElement>(null)
    const [ loaded, setLoaded ] = useState(false)

    const handleClickOutside = (e: MouseEvent) => {
       if(!buttonDropdown.current?.contains(e.target as Node)) setButtonDropdownVisible(false)
       if(!typeDropdown.current?.contains(e.target as Node)) setTypeDropdownVisible(false)
    }

    const handleClickerStart = async () => {
        setClickerActive(true)
        try {
            await invoke('start_clicker', { interval: clickInterval, button: mouseButton, click_type: clickType })
        } catch(error) {
            console.log('Clicker start error: ', error)
        }
    }

    const handleClickerStop = async () => {
        setClickerActive(false)
        try {
            await invoke('stop_clicker')
        } catch(error) {
            console.log("Clicker stop error: ")
        }
    }

    const handleChangeTriggerKey = async (e: KeyboardEvent) => {
        try {
            const newKey = e.key.toUpperCase()
            setTriggerKey(newKey)
            await invoke("change_trigger_key", { trigger_key: newKey })
            setListeningToKey(false)
        } catch(error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if(!listeningToKey) return

        window.addEventListener('keyup', handleChangeTriggerKey)
        return () => window.removeEventListener('keyup', handleChangeTriggerKey)
    }, [listeningToKey])

    const handleKeyPress = async (e: KeyboardEvent) => {  
        if(e.key.toUpperCase() !== triggerKey.toUpperCase() || !e.altKey) return

        if(clickerActive) return await handleClickerStop()
        await handleClickerStart()
    } 

    useEffect(() => {
        window.addEventListener('keyup', handleKeyPress)

        return () =>  window.removeEventListener('keyup', handleKeyPress)      
    }, [clickerActive, triggerKey])

    listen("clicker_state", (e) => setClickerActive(e.payload as boolean))

    const innit = async () => {
        setClickInterval(dataToLoad?.click_interval ?? 100)
        setMouseButton(dataToLoad?.mouse_button ?? "Left")
        setClickType(dataToLoad?.click_type ?? "Single")
        setTriggerKey(dataToLoad?.trigger_key ?? "`")
        setLoaded(true)

        try {
            await invoke("stop_clicker")
            await invoke("innit_clicker")
            await invoke("change_trigger_key", { trigger_key: dataToLoad?.trigger_key ?? "`" })
        } catch(error) {
            console.log("Error: ", error)
        }
    }

    useEffect(() => {
        window.addEventListener('click', handleClickOutside)

        innit()

        return () => window.removeEventListener('click', handleClickOutside)
    }, [])

    const saveData = async () => {
        if(!loaded) return
        try {
            const db = await Database.load('sqlite:data.db')

            const [clickerExists]: AutoClicker[] = await db.select("SELECT * FROM auto_clicker WHERE id LIKE $1", [id])

            if(clickerExists) return await db.execute("UPDATE auto_clicker SET click_interval = $1, mouse_button = $2, click_type = $3, trigger_key = $4 WHERE id LIKE $5",
                [clickInterval, mouseButton, clickType, triggerKey, id])

            await db.execute("INSERT INTO auto_clicker (id, click_interval, mouse_button, click_type, trigger_key) VALUES($1, $2, $3, $4, $5)", 
                [id, clickInterval, mouseButton, clickType, triggerKey])
        } catch (error) {
            console.error("Failed to save clicker:", error)
        }
    }

    useEffect(() => {
        saveData()
    }, [clickInterval, mouseButton, clickType, triggerKey])

    const updateClickerState = async () => {
        try {
            await invoke("update_clicker_state", { interval: clickInterval, button: mouseButton, click_type: clickType })
        } catch(error) {
            console.log(error)
        }
    }

    useEffect(() => {
        updateClickerState()
    }, [clickInterval, mouseButton, clickType])

    const handleInterval = (e: ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(10, Number(e.target.value))
        setClickInterval(value)
    }

    return <>
        <GridElement id={id} defaultSize='20 / 25 / span 36 / span 81' storedPosition={dataToLoad?.position} type='clicker'>
            <div className='auto-clicker' ref={ clicker }>
                <div className='container'>
                    <div className='wrapper'>
                        <p className='section-name'>Click interval (Miliseconds)</p>
                        <input type="number" id='interval' value={clickInterval} onChange={handleInterval}/>
                    </div>
                    <div className='options'>
                        <p className='section-name'>Click options</p>
                        <p className={`option ${buttonDropdownVisible ? 'active' : ''}`}>Mouse button: <span  onClick={(e) => { 
                            setButtonDropdownVisible(true)
                            setTypeDropdownVisible(false)
                            e.stopPropagation() 
                            }}>{mouseButton} <ArrowIcon /></span>
                        </p> 
                        {buttonDropdownVisible && <div className='dropdown btn' ref={ buttonDropdown }>
                            <p onClick={() => setMouseButton("Left")}>Left</p>
                            <p onClick={() => setMouseButton("Right")}>Right</p>
                            <p onClick={() => setMouseButton("Middle")}>Middle</p>
                        </div>}
                        <p className={`option ${typeDropdownVisible ? 'active' : ''}`}>Click type: <span onClick={(e) => {
                            e.stopPropagation()
                            setTypeDropdownVisible(true)
                            setButtonDropdownVisible(false)
                        }}>{clickType} <ArrowIcon /></span>
                        </p>
                        {typeDropdownVisible && <div className='dropdown type' ref={ typeDropdown }>
                            <p onClick={() => setClickType("Single")}>Single</p>
                            <p onClick={() => setClickType("Double")}>Double</p>
                        </div>}
                    </div>
                </div>
                <div className='controls'>
                    <p className='section-name'>Controls (Alt + hotkey)</p>
                    <button disabled={clickerActive} onClick={handleClickerStart}>Start ({triggerKey.toUpperCase()})</button>
                    <button disabled={!clickerActive} onClick={handleClickerStop}>Stop ({triggerKey.toUpperCase()})</button>
                    <button onClick={() => setListeningToKey(true)}>{listeningToKey ? "Enter hotkey" : "Change hotkey"}</button>
                </div>
            </div>
        </GridElement>
    </>
}