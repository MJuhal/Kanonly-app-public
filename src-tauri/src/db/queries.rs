use rusqlite::{params, Connection};
use crate::db::models::{AppData, Board, Column, Ticket};

pub fn init_db(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(crate::db::schema::SCHEMA_SQL)
        .map_err(|e| format!("Failed to initialize schema: {}", e))?;
    Ok(())
}

pub fn run_migrations(conn: &Connection) -> Result<(), String> {
    // Migration 1: add color to columns
    let has_color: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM pragma_table_info('columns') WHERE name = 'color'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0) > 0;
    if !has_color {
        conn.execute("ALTER TABLE columns ADD COLUMN color TEXT", [])
            .map_err(|e| format!("Failed to add color column: {}", e))?;
        log::info!("Migration: added 'color' column to columns table");
    }

    Ok(())
}

pub fn load_all_data(conn: &Connection) -> Result<AppData, String> {
    let mut stmt = conn
        .prepare("SELECT id, name, created_at, ticket_counter FROM boards ORDER BY created_at")
        .map_err(|e| e.to_string())?;
    let boards: Vec<Board> = stmt
        .query_map([], |row| {
            Ok(Board {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get::<_, i64>(2)? as u64,
                ticket_counter: row.get::<_, i64>(3)? as u32,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    drop(stmt);

    let mut stmt = conn
        .prepare("SELECT id, title, board_id, sort_order, color FROM columns ORDER BY board_id, sort_order")
        .map_err(|e| e.to_string())?;
    let mut columns: Vec<Column> = stmt
        .query_map([], |row| {
            Ok(Column {
                id: row.get(0)?,
                title: row.get(1)?,
                board_id: row.get(2)?,
                order: row.get(3)?,
                ticket_ids: Vec::new(),
                color: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    drop(stmt);

    // Load ticket ordering per column
    let mut stmt = conn
        .prepare("SELECT column_id, ticket_id, sort_order FROM column_ticket_order ORDER BY sort_order")
        .map_err(|e| e.to_string())?;
    let order_rows: Vec<(String, String)> = stmt
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    drop(stmt);

    for (col_id, ticket_id) in order_rows {
        if let Some(col) = columns.iter_mut().find(|c| c.id == col_id) {
            col.ticket_ids.push(ticket_id);
        }
    }

    let mut stmt = conn
        .prepare(
            "SELECT id, display_id, title, description, links, images, column_id, priority, created_at, deadline FROM tickets"
        )
        .map_err(|e| e.to_string())?;
    let tickets: Vec<Ticket> = stmt
        .query_map([], |row| {
            let links_json: Option<String> = row.get(4)?;
            let images_json: Option<String> = row.get(5)?;
            let priority: Option<String> = row.get(7)?;
            let deadline: Option<i64> = row.get(9)?;
            Ok(Ticket {
                id: row.get(0)?,
                display_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                links: links_json.and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default(),
                images: images_json.and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default(),
                column_id: row.get(6)?,
                priority,
                created_at: row.get::<_, i64>(8)? as u64,
                deadline: deadline.map(|d| d as u64),
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    drop(stmt);

    Ok(AppData {
        boards,
        columns,
        tickets,
    })
}

pub fn save_all_data(conn: &mut Connection, data: &AppData) -> Result<(), String> {
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    clear_all(&tx)?;
    insert_all(&tx, data)?;

    tx.commit().map_err(|e| format!("Failed to commit transaction: {}", e))?;
    Ok(())
}

fn clear_all(tx: &rusqlite::Transaction) -> Result<(), String> {
    tx.execute("DELETE FROM column_ticket_order", [])
        .map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM tickets", [])
        .map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM columns", [])
        .map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM boards", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn insert_all(tx: &rusqlite::Transaction, data: &AppData) -> Result<(), String> {
    for board in &data.boards {
        tx.execute(
            "INSERT INTO boards (id, name, created_at, ticket_counter) VALUES (?1, ?2, ?3, ?4)",
            params![
                board.id,
                board.name,
                board.created_at as i64,
                board.ticket_counter as i64
            ],
        )
        .map_err(|e| e.to_string())?;
    }

    for col in &data.columns {
        tx.execute(
            "INSERT INTO columns (id, title, board_id, sort_order, color) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![col.id, col.title, col.board_id, col.order, col.color.as_deref()],
        )
        .map_err(|e| e.to_string())?;

        for (sort_order, ticket_id) in col.ticket_ids.iter().enumerate() {
            tx.execute(
                "INSERT INTO column_ticket_order (column_id, ticket_id, sort_order) VALUES (?1, ?2, ?3)",
                params![col.id, ticket_id, sort_order as i64],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    for ticket in &data.tickets {
        let links_json = serde_json::to_string(&ticket.links).unwrap_or_else(|_| "[]".to_string());
        let images_json = serde_json::to_string(&ticket.images).unwrap_or_else(|_| "[]".to_string());
        let deadline = ticket.deadline.map(|d| d as i64);

        tx.execute(
            "INSERT INTO tickets (id, display_id, title, description, links, images, column_id, priority, created_at, deadline) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                ticket.id,
                ticket.display_id,
                ticket.title,
                ticket.description,
                links_json,
                images_json,
                ticket.column_id,
                ticket.priority.as_deref(),
                ticket.created_at as i64,
                deadline
            ],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}
