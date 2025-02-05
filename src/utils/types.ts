declare global {
    type Note = {
        id: string
        content: string
        position: string
    }

    type AutoClicker = {
        id: string
        clickInterval: number
        mouseButton: string
        clickType: string
        triggerKey: string
        position: string
    }
    
    type Clock = {
        id: string
        timerRingtone: string
        alarms: Alarm[]
        volume: number
        activeElement: string
        position: string
    }

    type Alarm = {
        id: string
        clockId: string
        label: string
        time: string
        postponedTime: string | null
        active: string | boolean
        frequency: string
        ringtone: string
    }
}

export {}