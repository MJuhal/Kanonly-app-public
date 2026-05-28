mod db;

use db::models::AppData;

#[tauri::command]
fn load_all_data() -> Result<AppData, String> {
    // If JSON legacy exists, migrate first
    if db::has_json_legacy() {
        db::migrate_from_json()?;
    }
    db::load_data()
}

#[tauri::command]
fn save_all_data(data: AppData) -> Result<(), String> {
    db::save_data(&data)
}

#[tauri::command]
fn get_data_path() -> Result<String, String> {
    let dir = dirs::data_local_dir()
        .ok_or("Failed to get local data dir")?
        .join("KANONLY")
        .join("data");
    Ok(dir.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![load_all_data, save_all_data, get_data_path])
        .setup(|app| {
            app.handle().plugin(
                tauri_plugin_log::Builder::default()
                    .targets([
                        tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                        tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir { file_name: None }),
                        tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview),
                    ])
                    .level(if cfg!(debug_assertions) {
                        log::LevelFilter::Info
                    } else {
                        log::LevelFilter::Warn
                    })
                    .build(),
            )?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
