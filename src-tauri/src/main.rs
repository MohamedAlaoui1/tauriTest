#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    Manager,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_autostart::ManagerExt;

#[tauri::command]
fn show_popup(app: tauri::AppHandle, app_name: String) {
    if let Some(popup) = app.get_webview_window("popup") {
        if let Some(monitor) = app.primary_monitor().unwrap() {
            let screen = monitor.size();
            let scale = monitor.scale_factor();
            let x = (screen.width as f64 / scale) as i32 - 340;
            let y = (screen.height as f64 / scale) as i32 - 170;
            popup.set_position(tauri::PhysicalPosition::new(x, y)).unwrap();
        }
        popup.show().unwrap();
        popup.set_focus().unwrap();
    }
}

#[tauri::command]
fn start_transcription(app: tauri::AppHandle) {
    if let Some(popup) = app.get_webview_window("popup") {
        popup.hide().unwrap();
    }
    if let Some(window) = app.get_webview_window("main") {
        window.show().unwrap();
        window.set_focus().unwrap();
    }
}

#[tauri::command]
fn dismiss_popup(app: tauri::AppHandle) {
    if let Some(popup) = app.get_webview_window("popup") {
        popup.hide().unwrap();
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
        .invoke_handler(tauri::generate_handler![show_popup, start_transcription, dismiss_popup])
        .setup(|app| {
            // Enable autostart
            let autostart_manager = app.autolaunch();
            let _ = autostart_manager.enable();

            // Hide all windows on startup
            if let Some(window) = app.get_webview_window("main") {
                window.hide().unwrap();
            }
            if let Some(popup) = app.get_webview_window("popup") {
                popup.hide().unwrap();
            }

            // Build tray menu
            let open = MenuItemBuilder::new("Open Memo").id("open").build(app)?;
            let quit = MenuItemBuilder::new("Quit").id("quit").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&open, &quit]).build()?;

            // Build tray icon
            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Memo")
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "open" => {
                        if let Some(window) = app.get_webview_window("main") {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap() {
                                window.hide().unwrap();
                            } else {
                                window.show().unwrap();
                                window.set_focus().unwrap();
                            }
                        }
                    }
                })
                .build(app)?;

            // Launch detector on Windows only
            #[cfg(target_os = "windows")]
            {
                let handle = app.handle().clone();
                std::thread::spawn(move || {
                    handle
                        .shell()
                        .sidecar("detector")
                        .unwrap()
                        .spawn()
                        .unwrap();
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}