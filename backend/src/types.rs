use serde::{Deserialize, Serialize};
use sqlx::types::Uuid;
use ts_rs::TS;

#[derive(Serialize, Deserialize, sqlx::FromRow, Clone, TS)]
#[ts(export)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub picture: Option<String>,
}

#[derive(Serialize, Deserialize, sqlx::FromRow, Clone, TS)]
#[ts(export)]
pub struct Course {
    pub id: Uuid,
    pub name: String,
}

#[derive(Serialize, Deserialize, sqlx::FromRow, Clone, TS)]
#[ts(export)]
pub struct Block {
    pub id: Uuid,
    pub course_id: Uuid,
    pub block_type: String,
    pub week_day: i16,
    pub start_time: chrono::NaiveTime,
    pub end_time: chrono::NaiveTime,
    pub location: String,
}
