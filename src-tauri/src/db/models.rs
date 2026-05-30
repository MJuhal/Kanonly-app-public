use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Board {
    pub id: String,
    pub name: String,
    pub created_at: u64,
    pub ticket_counter: u32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Column {
    pub id: String,
    pub title: String,
    pub board_id: String,
    pub order: i32,
    pub ticket_ids: Vec<String>,
    pub color: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Ticket {
    pub id: String,
    pub display_id: String,
    pub title: String,
    pub description: String,
    pub links: Vec<String>,
    pub images: Vec<String>,
    pub column_id: String,
    pub priority: Option<String>,
    pub created_at: u64,
    pub deadline: Option<u64>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AppData {
    pub boards: Vec<Board>,
    pub columns: Vec<Column>,
    pub tickets: Vec<Ticket>,
}
