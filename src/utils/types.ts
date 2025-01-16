declare global {
    type Note = {
        id: string
        content: string
        position: string
    }

    type AutoClicker = {
        id: string
        click_interval: number
        mouse_button: string
        click_type: string
        trigger_key: string
        position: string
    }
}

export {}