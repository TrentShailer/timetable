use crate::error::AppError;
use crate::utils::database::courses::{
    clone_course, create_course, delete_course, get_course, update_course,
};
use crate::SESSION_USER_KEY;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Deserialize;
use sqlx::PgPool;
use tower_sessions::Session;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct ImportBody {
    id: Uuid,
}

pub async fn route_post_import_course(
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<ImportBody>,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let cloned_course = clone_course(&pool, &body.id, &user_id).await?;

    match cloned_course {
        Some(cloned_course) => Ok(Json(cloned_course).into_response()),
        None => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}

pub async fn route_delete_course(
    Path(course_id): Path<Uuid>,
    State(pool): State<PgPool>,
    session: Session,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let maybe_course = delete_course(&pool, &course_id, &user_id).await?;

    match maybe_course {
        Some(_) => Ok(StatusCode::OK.into_response()),
        None => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}

pub async fn route_get_course(
    Path(course_id): Path<Uuid>,
    State(pool): State<PgPool>,
    session: Session,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let maybe_course = get_course(&pool, &course_id, &user_id).await?;

    match maybe_course {
        Some(course) => Ok(Json(course).into_response()),
        None => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}

#[derive(Deserialize)]
pub struct PostBody {
    name: String,
}

pub async fn route_post_course(
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<PostBody>,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let course = create_course(&pool, &user_id, &body.name).await?;

    Ok(Json(course).into_response())
}

#[derive(Deserialize)]
pub struct PutBody {
    name: String,
}

pub async fn route_put_course(
    Path(course_id): Path<Uuid>,
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<PutBody>,
) -> Result<Response, AppError> {
    let user_id: Uuid = match session.get(SESSION_USER_KEY)? {
        Some(user_id) => user_id,
        None => return Ok(StatusCode::UNAUTHORIZED.into_response()),
    };

    let maybe_course = update_course(&pool, &course_id, &user_id, &body.name).await?;

    match maybe_course {
        Some(course) => Ok(Json(course).into_response()),
        None => Ok(StatusCode::NOT_FOUND.into_response()),
    }
}
