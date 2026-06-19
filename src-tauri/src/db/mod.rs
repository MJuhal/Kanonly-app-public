use std::fs;
use std::path::PathBuf;

pub mod models;
pub mod queries;
pub mod schema;

use crate::db::models::AppData;
use crate::db::queries::{init_db, load_all_data, save_all_data, run_migrations};

const DB_FILE: &str = "miikanban.db";
const DATA_DIR: &str = "data";

fn data_dir() -> Result<PathBuf, String> {
    let dir = dirs::data_local_dir()
        .ok_or("Failed to get local data dir")?
        .join("KANONLY")
        .join(DATA_DIR);
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create data dir: {}", e))?;

    // Migrate from old MIIKANBAN folder if exists
    let old_dir = dirs::data_local_dir()
        .ok_or("Failed to get local data dir")?
        .join("MIIKANBAN")
        .join(DATA_DIR);
    if !dir.join(DB_FILE).exists() && old_dir.join(DB_FILE).exists() {
        log::info!("Migrating data from {:?} to {:?}", old_dir, dir);
        copy_dir_all(&old_dir, &dir)
            .map_err(|e| format!("Failed to migrate data: {}", e))?;
    }

    Ok(dir)
}

fn legacy_data_dir() -> Result<PathBuf, String> {
    std::env::current_dir()
        .map(|d| d.join(DATA_DIR))
        .map_err(|e| format!("Failed to get current dir: {}", e))
}

fn db_path() -> Result<PathBuf, String> {
    Ok(data_dir()?.join(DB_FILE))
}

pub fn open_connection() -> Result<rusqlite::Connection, String> {
    let path = db_path()?;
    log::debug!("Opening SQLite at {:?}", path);
    let conn = rusqlite::Connection::open(&path)
        .map_err(|e| format!("Failed to open SQLite DB at {:?}: {}", path, e))?;
    log::debug!("SQLite opened successfully");
    Ok(conn)
}

pub fn ensure_db_initialized() -> Result<rusqlite::Connection, String> {
    let path = db_path()?;
    let existed = path.exists();
    let mut conn = open_connection()?;
    if !existed {
        log::debug!("DB did not exist, initializing schema...");
        init_db(&mut conn)?;
        log::debug!("DB schema initialized");
    }
    run_migrations(&conn)?;
    Ok(conn)
}

pub fn load_data() -> Result<AppData, String> {
    let mut conn = ensure_db_initialized()?;
    load_all_data(&mut conn)
}

pub fn save_data(data: &AppData) -> Result<(), String> {
    let mut conn = open_connection()?;
    save_all_data(&mut conn, data)
}

pub fn has_json_legacy() -> bool {
    // If DB already exists in primary path, we're in SQLite mode — no migration needed
    if let Ok(dir) = data_dir() {
        if dir.join(DB_FILE).exists() {
            return false;
        }
        if dir.join("boards.json").exists() {
            return true;
        }
    }
    // Check legacy data path for transition
    if let Ok(dir) = legacy_data_dir() {
        if dir.join("boards.json").exists() {
            return true;
        }
    }
    false
}

pub fn migrate_from_json() -> Result<(), String> {
    let data_dir_path = data_dir()?;
    let mut boards_file = data_dir_path.join("boards.json");

    // If no JSON in primary path, check legacy path and stage files for migration
    if !boards_file.exists() {
        let legacy_dir = legacy_data_dir()?;
        let legacy_boards = legacy_dir.join("boards.json");
        if legacy_boards.exists() {
            log::info!("Staging legacy data from {:?} to {:?}", legacy_dir, data_dir_path);
            copy_dir_all(&legacy_dir, &data_dir_path)
                .map_err(|e| format!("Failed to copy legacy data to primary dir: {}", e))?;
            boards_file = data_dir_path.join("boards.json");
        }
    }

    if !boards_file.exists() {
        return Ok(());
    }

    log::info!("Detected JSON legacy data. Starting migration...");

    // Backup: copy data dir contents to data_backup_{timestamp} (preserve originals)
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let backup_dir = data_dir_path.with_file_name(format!("data_backup_{}", timestamp));

    fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("Failed to create backup dir: {}", e))?;

    copy_dir_all(&data_dir_path, &backup_dir)
        .map_err(|e| format!("Failed to copy data to backup: {}", e))?;

    log::info!("Backup created at {:?}", backup_dir);

    // Read boards
    let boards_content = fs::read_to_string(&boards_file)
        .map_err(|e| format!("Failed to read boards.json: {}", e))?;
    let boards: Vec<models::Board> = serde_json::from_str(&boards_content)
        .map_err(|e| format!("Failed to parse boards.json: {}", e))?;
    log::info!("Loaded {} boards", boards.len());

    // Read notes
    let notes_file = data_dir_path.join("notes.json");
    let notes: Vec<models::Note> = if notes_file.exists() {
        let content = fs::read_to_string(&notes_file)
            .map_err(|e| format!("Failed to read notes.json: {}", e))?;
        let n: Vec<models::Note> = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse notes.json: {}", e))?;
        log::info!("Loaded {} notes", n.len());
        n
    } else {
        log::info!("No notes.json found");
        Vec::new()
    };

    let mut all_columns = Vec::new();
    let mut all_tickets = Vec::new();

    for board in &boards {
        let b_dir = data_dir_path.join(&board.id);

        let cols_file = b_dir.join("columns.json");
        if cols_file.exists() {
            let content = fs::read_to_string(&cols_file)
                .map_err(|e| format!("Failed to read columns.json: {}", e))?;
            let cols: Vec<models::Column> = serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse columns.json: {}", e))?;
            log::info!("Board {}: loaded {} columns", board.id, cols.len());
            all_columns.extend(cols);
        }

        let t_dir = b_dir.join("tickets");
        if t_dir.exists() {
            let mut count = 0;
            for entry in fs::read_dir(&t_dir).map_err(|e| e.to_string())? {
                let entry = entry.map_err(|e| e.to_string())?;
                let path = entry.path();
                if path.extension().and_then(|s| s.to_str()) == Some("json") {
                    let content = fs::read_to_string(&path)
                        .map_err(|e| format!("Failed to read ticket: {}", e))?;
                    let ticket: models::Ticket = serde_json::from_str(&content)
                        .map_err(|e| format!("Failed to parse ticket {}: {}", path.display(), e))?;
                    all_tickets.push(ticket);
                    count += 1;
                }
            }
            log::info!("Board {}: loaded {} tickets", board.id, count);
        }
    }

    let app_data = AppData {
        boards,
        columns: all_columns,
        tickets: all_tickets,
        notes,
    };

    log::info!("Total: {} boards, {} columns, {} tickets, {} notes", 
        app_data.boards.len(), app_data.columns.len(), app_data.tickets.len(), app_data.notes.len());

    // Initialize DB and save migrated data
    log::info!("Initializing SQLite DB...");
    let mut conn = ensure_db_initialized()?;
    log::info!("Saving to SQLite...");
    save_all_data(&mut conn, &app_data)?;
    log::info!("Data saved to SQLite successfully");

    // Only after successful migration, remove JSON files
    cleanup_json_files(&data_dir_path)?;
    log::info!("JSON cleanup done. Migration complete.");

    Ok(())
}

fn copy_dir_all(src: &PathBuf, dst: &PathBuf) -> Result<(), std::io::Error> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());
        if src_path.is_dir() {
            copy_dir_all(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }
    Ok(())
}

fn cleanup_json_files(dir: &PathBuf) -> Result<(), String> {
    // Remove boards.json and notes.json
    let _ = fs::remove_file(dir.join("boards.json"));
    let _ = fs::remove_file(dir.join("notes.json"));

    // Remove board subdirectories (columns.json + tickets/)
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_dir() {
            let _ = fs::remove_dir_all(&path);
        }
    }

    Ok(())
}
