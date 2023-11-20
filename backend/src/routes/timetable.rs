use crate::error::AppError;
use crate::types::{Block, Course};
use crate::utils::database::blocks::get_all_blocks;
use crate::utils::database::courses::{delete_all_courses, get_all_courses};
use crate::SESSION_USER_KEY;
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Serialize;
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

#[derive(Serialize)]
struct TimetableResponse {
    courses: Vec<Course>,
    blocks: Vec<Block>,
}

pub async fn route_get_timetable(
    State(pool): State<PgPool>,
    session: Session,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let courses = get_all_courses(&pool, &user_id).await?;
    let blocks = get_all_blocks(&pool, &user_id).await?;

    let response = TimetableResponse { courses, blocks };

    Ok(Json(response).into_response())
}

pub async fn route_delete_timetable(
    State(pool): State<PgPool>,
    session: Session,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    delete_all_courses(&pool, &user_id).await?;

    Ok(StatusCode::OK.into_response())
}
