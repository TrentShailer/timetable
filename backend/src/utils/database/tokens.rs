use sqlx::PgPool;
use uuid::Uuid;

use crate::error::QueryError;

pub async fn create_token(
    pool: &PgPool,
    user_id: &Uuid,
    token: &String,
    expires_in: &i32,
    scope: &String,
    refresh_token: &String,
) -> Result<(), QueryError> {
    sqlx::query!(
        r#"
        INSERT INTO tokens (user_id, token, expires_in, scope, refresh_token)
        VALUES ($1, $2, $3, $4, $5)
        "#,
        user_id,
        token,
        expires_in,
        scope,
        refresh_token
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn update_token(
    pool: &PgPool,
    user_id: &Uuid,
    token: &String,
    expires_in: &i32,
    scope: &String,
    refresh_token: &String,
) -> Result<Option<()>, QueryError> {
    let rows_affected = sqlx::query!(
        r#"
        UPDATE tokens
        SET token = $2, expires_in = $3, scope = $4, refresh_token = $5
        WHERE user_id = $1
        "#,
        user_id,
        token,
        expires_in,
        scope,
        refresh_token,
    )
    .execute(pool)
    .await?
    .rows_affected();

    if rows_affected == 0 {
        return Ok(None);
    }

    Ok(Some(()))
}
