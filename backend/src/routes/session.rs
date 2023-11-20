use crate::error::AppError;
use crate::utils::database::users::get_user;
use crate::SESSION_USER_KEY;
use axum::extract::{Json, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

pub async fn route_get_session(
    State(pool): State<PgPool>,
    session: Session,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let maybe_user = get_user(&pool, &user_id).await?;

    match maybe_user {
        Some(user) => Ok(Json(user).into_response()),
        None => Ok(StatusCode::UNAUTHORIZED.into_response()),
    }
}

pub async fn route_delete_session(session: Session) -> Result<Response, AppError> {
    session.delete();

    Ok(StatusCode::OK.into_response())
}
