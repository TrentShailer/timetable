use crate::utils::auth::{get_google_token, get_user_data_from_token};
use crate::utils::database::tokens::{create_token, update_token};
use crate::utils::database::users::{create_user, get_user_from_email};
use crate::SESSION_USER_KEY;
use axum::extract::{Json, State};
use axum::response::{IntoResponse, Response};
use serde::Deserialize;
use sqlx::PgPool;
use tower_sessions::Session;

use crate::error::{AppError, QueryError};

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct AuthRequest {
    code: String,
}

// Endpoint for sign in with google button
pub async fn route_post_auth_google(
    State(pool): State<PgPool>,
    session: Session,
    Json(body): Json<AuthRequest>,
) -> Result<Response, AppError> {
    // Exchange code for token
    let google_token = get_google_token(body.code.as_str()).await?;

    // Fetch user data from Google
    let user_data = get_user_data_from_token(google_token.access_token.as_str()).await?;

    // get user if they exist, or create a new user
    let user = match get_user_from_email(&pool, &user_data.email).await? {
        Some(user) => user,
        None => create_user(&pool, &user_data.email, &user_data.name, &user_data.picture).await?,
    };

    // Create the token, if one already exists then update it instead
    match create_token(
        &pool,
        &user.id,
        &google_token.access_token,
        &google_token.expires_in,
        &google_token.scope,
        &google_token.refresh_token,
    )
    .await
    {
        Ok(_) => Ok(()),
        Err(error) => match error {
            QueryError::UniqueViolation(error) => {
                match update_token(
                    &pool,
                    &user.id,
                    &google_token.access_token,
                    &google_token.expires_in,
                    &google_token.scope,
                    &google_token.refresh_token,
                )
                .await?
                {
                    Some(_) => Ok(()),
                    None => Err(QueryError::from(error)),
                }
            }
            _ => Err(error),
        },
    }?;

    session.insert(SESSION_USER_KEY, user.id)?;

    Ok(Json(user).into_response())
}
