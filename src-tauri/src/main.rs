#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    Emitter,
    Manager,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
};

use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_autostart::ManagerExt;

#[tauri::command]
fn show_popup(app: tauri::AppHandle, _app_name: String) {
    if let Some(popup) = app.get_webview_window("popup") {
        if let Some(monitor) = app.primary_monitor().unwrap() {
            let screen = monitor.size();
            let scale = monitor.scale_factor();
            let width = 320.0 * scale;
            let height = 150.0 * scale;
            let x = screen.width as f64 - width - 20.0;
            let y = screen.height as f64 - height - 60.0;
            popup.set_position(tauri::PhysicalPosition::new(x as i32, y as i32)).unwrap();
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
    // Emit event to trigger new meeting
    app.emit("start-new-meeting", ()).unwrap();
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
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // If user clicks desktop shortcut while app is running, show the window
            if let Some(window) = app.get_webview_window("main") {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
        }))
        .invoke_handler(tauri::generate_handler![show_popup, start_transcription, dismiss_popup])
        .setup(|app| {
            // Enable autostart
            let autostart_manager = app.autolaunch();
            let _ = autostart_manager.enable();

            // Hide all windows on startup
            if let Some(window) = app.get_webview_window("main") {
                // Intercept X button — hide to tray instead of closing
                let w = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        w.hide().unwrap();
                    }
                });
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