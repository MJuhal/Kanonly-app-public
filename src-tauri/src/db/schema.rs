pub const SCHEMA_SQL: &str = r#"
CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    created_at INTEGER NOT NULL,
    ticket_counter INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    board_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    color TEXT
);

CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    display_id TEXT NOT NULL,
    title TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    links TEXT,
    images TEXT,
    column_id TEXT NOT NULL,
    priority TEXT,
    created_at INTEGER NOT NULL,
    deadline INTEGER
);

CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    links TEXT,
    images TEXT,
    priority TEXT,
    created_at INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS column_ticket_order (
    column_id TEXT NOT NULL,
    ticket_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    PRIMARY KEY (column_id, ticket_id)
);

CREATE TABLE IF NOT EXISTS __migrations (
    version INTEGER PRIMARY KEY,
    applied_at INTEGER NOT NULL
);
"#;
