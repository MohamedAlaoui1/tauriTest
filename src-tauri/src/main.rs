#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::{
    Emitter, Manager,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
};
use tauri_plugin_shell::ShellExt;

// ── Commands invoked from popup.html ──────────────────────────────────────

#[tauri::command]
fn show_popup(app: tauri::AppHandle, app_name: String) {
    if let Some(popup) = app.get_webview_window("popup") {
        if let Some(monitor) = app.primary_monitor().unwrap() {
            let screen = monitor.size();
            let scale = monitor.scale_factor();
            let width = 320.0 * scale;
            let height = 150.0 * scale;
            let x = screen.width as f64 - width - 20.0;
            let y = screen.height as f64 - height - 60.0;
            popup
                .set_position(tauri::PhysicalPosition::new(x as i32, y as i32))
                .unwrap();
        }
        app.emit_to("popup", "popup-reset", app_name).unwrap();
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
    app.emit("start-new-meeting", ()).unwrap();
}

#[tauri::command]
fn dismiss_popup(app: tauri::AppHandle) {
    if let Some(popup) = app.get_webview_window("popup") {
        popup.hide().unwrap();
    }
}

// ── Poll Python backend every 3s ──────────────────────────────────────────

fn start_detector_polling(app: tauri::AppHandle) {
    let call_was_active = Arc::new(AtomicBool::new(false));

    std::thread::spawn(move || {
        // Wait for Python sidecar to boot
        std::thread::sleep(std::time::Duration::from_secs(4));

        loop {
            let result = ureq::get("http://127.0.0.1:8000/status")
                .timeout(std::time::Duration::from_secs(2))
                .call();

            match result {
                Ok(response) => {
                    if let Ok(body) = response.into_string() {
                        if let Ok(json) =
                            serde_json::from_str::<serde_json::Value>(&body)
                        {
                            let call_active =
                                json["call_active"].as_bool().unwrap_or(false);
                            let app_name = json["app_name"]
                                .as_str()
                                .unwrap_or("Unknown")
                                .to_string();
                            let was_active =
                                call_was_active.load(Ordering::SeqCst);

                            if call_active && !was_active {
                                call_was_active.store(true, Ordering::SeqCst);
                                show_popup(app.clone(), app_name);
                            } else if !call_active && was_active {
                                call_was_active.store(false, Ordering::SeqCst);
                                if let Some(popup) =
                                    app.get_webview_window("popup")
                                {
                                    let _ = popup.hide();
                                }
                            }
                        }
                    }
                }
                Err(_) => {} // Backend not ready yet, keep retrying
            }

            std::thread::sleep(std::time::Duration::from_secs(3));
        }
    });
}

// ── Main ──────────────────────────────────────────────────────────────────

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            show_popup,
            start_transcription,
            dismiss_popup,
        ])
        .setup(|app| {
            // Main window: hide on start, intercept close → hide to tray
            if let Some(window) = app.get_webview_window("main") {
                let w = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        w.hide().unwrap();
                    }
                });
                window.hide().unwrap();
            }

            // Popup: always start hidden
            if let Some(popup) = app.get_webview_window("popup") {
                popup.hide().unwrap();
            }

            // System tray
            let open = MenuItemBuilder::new("Open Memo").id("open").build(app)?;
            let quit = MenuItemBuilder::new("Quit").id("quit").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&open, &quit]).build()?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Memo")
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "open" => {
                        if let Some(w) = app.get_webview_window("main") {
                            w.show().unwrap();
                            w.set_focus().unwrap();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left, ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(w) = app.get_webview_window("main") {
                            if !w.is_visible().unwrap_or(false) {
                                w.show().unwrap();
                                w.set_focus().unwrap();
                            }
                        }
                    }
                })
                .build(app)?;

            // Launch Python detector sidecar
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                handle
                    .shell()
                    .sidecar("detector")
                    .unwrap()
                    .spawn()
                    .unwrap();
            });

            // Start polling loop
            start_detector_polling(app.handle().clone());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}