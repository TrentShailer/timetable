use crate::error::AppError;
use crate::types::{Block, Course, User};
use crate::utils::database::blocks::get_all_blocks;
use crate::utils::database::courses::get_all_courses;
use crate::utils::database::users::delete_user;
use crate::utils::database::users::get_user;
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
struct UserDataResponse {
    user: User,
    courses: Vec<Course>,
    blocks: Vec<Block>,
}

pub async fn route_get_user_data(
    State(pool): State<PgPool>,
    session: Session,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let maybe_user = get_user(&pool, &user_id).await?;
    let user = match maybe_user {
        Some(user) => user,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let courses = get_all_courses(&pool, &user_id).await?;
    let blocks = get_all_blocks(&pool, &user_id).await?;

    let response = UserDataResponse {
        user,
        courses,
        blocks,
    };

    Ok(Json(response).into_response())
}

pub async fn route_delete_user_data(
    State(pool): State<PgPool>,
    session: Session,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let maybe_user = delete_user(&pool, &user_id).await?;
    match maybe_user {
        Some(_) => {}
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    session.delete();

    Ok(StatusCode::OK.into_response())
}
