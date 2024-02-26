use crate::error::AppError;
use crate::utils::database::blocks::{create_block, delete_block, get_block, update_block};
use crate::SESSION_USER_KEY;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Deserialize;
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

pub async fn route_delete_block(
    Path((_, block_id)): Path<(Uuid, Uuid)>,
    State(pool): State<PgPool>,
    session: Session,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let maybe_block = delete_block(&pool, &block_id, &user_id).await?;

    match maybe_block {
        Some(_) => Ok(StatusCode::OK.into_response()),
        None => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}

pub async fn route_get_block(
    Path((_, block_id)): Path<(Uuid, Uuid)>,
    State(pool): State<PgPool>,
    session: Session,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let maybe_block = get_block(&pool, &block_id, &user_id).await?;

    match maybe_block {
        Some(block) => Ok(Json(block).into_response()),
        None => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}

#[derive(Deserialize)]
pub struct PostBody {
    block_type: String,
    week_day: i16,
    start_time: chrono::NaiveTime,
    end_time: chrono::NaiveTime,
    location: String,
    notes: Option<String>,
}

pub async fn route_post_block(
    Path(course_id): Path<Uuid>,
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<PostBody>,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let block = create_block(
        &pool,
        &user_id,
        &course_id,
        &body.block_type,
        &body.week_day,
        &body.start_time,
        &body.end_time,
        &body.location,
        &body.notes,
    )
    .await?;

    Ok(Json(block).into_response())
}

#[derive(Deserialize)]
pub struct PutBody {
    course_id: Uuid,
    block_type: String,
    week_day: i16,
    start_time: chrono::NaiveTime,
    end_time: chrono::NaiveTime,
    location: String,
    notes: Option<String>,
}

pub async fn route_put_block(
    Path((_course_id, block_id)): Path<(Uuid, Uuid)>,
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<PutBody>,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let maybe_block = update_block(
        &pool,
        &block_id,
        &user_id,
        &body.course_id,
        &body.block_type,
        &body.week_day,
        &body.start_time,
        &body.end_time,
        &body.location,
        &body.notes,
    )
    .await?;

    match maybe_block {
        Some(block) => Ok((Json(block)).into_response()),
        None => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}
