// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use inputbot::KeybdKey;
use std::sync::{atomic::AtomicBool, Arc};
use tokio::sync::Mutex;
mod auto_clicker;
use auto_clicker::{ change_trigger_key, start_clicker, innit_clicker, stop_clicker, update_clicker_state, ClickType, ClickerState, MouseButton };

pub fn run() {
    let clicker_state = ClickerState {
        running: Arc::new(std::sync::Mutex::new(AtomicBool::new(false))),
        interval: Arc::new(Mutex::new(100)),
        button: Arc::new(Mutex::new(MouseButton::Left)),
        click_type: Arc::new(Mutex::new(ClickType::Single)),
        trigger_key: Arc::new(Mutex::new(KeybdKey::BackquoteKey)),
        thread_handle: Arc::new(Mutex::new(None)),
    };

    tauri::Builder::default()
        .manage(clicker_state)
        .invoke_handler(tauri::generate_handler![
            start_clicker,
            stop_clicker,
            innit_clicker,
            change_trigger_key,
            update_clicker_state
        ])
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .run(tauri::generate_context!())
        .unwrap();
}
