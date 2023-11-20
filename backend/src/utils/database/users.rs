use sqlx::PgPool;
use uuid::Uuid;

use crate::{error::QueryError, types::User};

pub async fn create_user(
    pool: &PgPool,
    email: &String,
    name: &String,
    picture: &Option<String>,
) -> Result<User, QueryError> {
    let user = sqlx::query_as!(
        User,
        r#"
        INSERT INTO users (email, name, picture)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, picture
        "#,
        email,
        name,
        picture.as_ref()
    )
    .fetch_one(pool)
    .await?;

    Ok(user)
}

pub async fn _update_user(
    pool: &PgPool,
    id: &Uuid,
    email: &String,
    name: &String,
    picture: &Option<String>,
) -> Result<Option<User>, QueryError> {
    let user = sqlx::query_as!(
        User,
        r#"
        UPDATE users
        SET email = $2, name = $3, picture = $4
        WHERE id = $1
        RETURNING id, name, email, picture
        "#,
        id,
        email,
        name,
        picture.as_ref()
    )
    .fetch_optional(pool)
    .await?;

    Ok(user)
}

pub async fn get_user(pool: &PgPool, id: &Uuid) -> Result<Option<User>, QueryError> {
    let user = sqlx::query_as!(
        User,
        r#"
        SELECT id, name, email, picture
        FROM users
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(pool)
    .await?;

    Ok(user)
}

pub async fn get_user_from_email(
    pool: &PgPool,
    email: &String,
) -> Result<Option<User>, QueryError> {
    let user = sqlx::query_as!(
        User,
        r#"
        SELECT id, name, email, picture
        FROM users
        WHERE email = $1
        "#,
        email
    )
    .fetch_optional(pool)
    .await?;

    Ok(user)
}

pub async fn delete_user(pool: &PgPool, id: &Uuid) -> Result<Option<User>, QueryError> {
    let user = sqlx::query_as!(
        User,
        r#"
        DELETE FROM users
        WHERE id = $1
        RETURNING id, name, email, picture
        "#,
        id
    )
    .fetch_optional(pool)
    .await?;

    Ok(user)
}
