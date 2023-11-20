use chrono::NaiveTime;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{error::QueryError, types::Block};

pub async fn block_exists(pool: &PgPool, block_id: &Uuid) -> Result<bool, QueryError> {
    let block = sqlx::query!("SELECT id FROM blocks WHERE id = $1", block_id)
        .fetch_optional(pool)
        .await?;

    match block {
        Some(_) => Ok(true),
        None => Ok(false),
    }
}

pub async fn create_block(
    pool: &PgPool,
    user_id: &Uuid,
    course_id: &Uuid,
    block_type: &String,
    day: &i16,
    start_time: &NaiveTime,
    end_time: &NaiveTime,
    location: &String,
) -> Result<Block, QueryError> {
    let block = sqlx::query_as!(
        Block,
        r#"
        INSERT INTO blocks (user_id, course_id, block_type, week_day, start_time, end_time, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, course_id, block_type, week_day, start_time, end_time, location
        "#,
        user_id,
        course_id,
        block_type,
        day,
        start_time,
        end_time,
        location,
    )
    .fetch_one(pool)
    .await?;

    Ok(block)
}

pub async fn update_block(
    pool: &PgPool,
    id: &Uuid,
    user_id: &Uuid,
    course_id: &Uuid,
    block_type: &String,
    day: &i16,
    start_time: &NaiveTime,
    end_time: &NaiveTime,
    location: &String,
) -> Result<Option<Block>, QueryError> {
    let block = sqlx::query_as!(
        Block,
        r#"
        UPDATE blocks
        SET course_id = $3, block_type = $4, week_day = $5, start_time = $6, end_time = $7, location = $8
        WHERE id = $1 AND user_id = $2
        RETURNING id, course_id, block_type, week_day, start_time, end_time, location
        "#,
        id,
        user_id,
        course_id,
        block_type,
        day,
        start_time,
        end_time,
        location
    )
    .fetch_optional(pool)
    .await?;

    match block {
        Some(block) => return Ok(Some(block)),
        None => {}
    };

    // If nothing was returned but the block does exist, then the user isn't the owner
    if block_exists(pool, id).await? {
        return Err(QueryError::OwnerViolation);
    }

    Ok(None)
}

pub async fn get_block(
    pool: &PgPool,
    id: &Uuid,
    user_id: &Uuid,
) -> Result<Option<Block>, QueryError> {
    let block = sqlx::query_as!(
        Block,
        r#"
        SELECT id, course_id, block_type, week_day, start_time, end_time, location
        FROM blocks
        WHERE id = $1 AND user_id = $2
        "#,
        id,
        user_id
    )
    .fetch_optional(pool)
    .await?;

    match block {
        Some(block) => return Ok(Some(block)),
        None => {}
    };

    if block_exists(pool, id).await? {
        return Err(QueryError::OwnerViolation);
    }

    Ok(None)
}

pub async fn delete_block(
    pool: &PgPool,
    id: &Uuid,
    user_id: &Uuid,
) -> Result<Option<Block>, QueryError> {
    let block = sqlx::query_as!(
        Block,
        r#"
        DELETE FROM blocks
        WHERE id = $1 AND user_id = $2
        RETURNING id, course_id, block_type, week_day, start_time, end_time, location
        "#,
        id,
        user_id
    )
    .fetch_optional(pool)
    .await?;

    match block {
        Some(block) => return Ok(Some(block)),
        None => {}
    };

    if block_exists(pool, id).await? {
        return Err(QueryError::OwnerViolation);
    }

    Ok(None)
}

pub async fn get_all_blocks(pool: &PgPool, user_id: &Uuid) -> Result<Vec<Block>, QueryError> {
    let blocks = sqlx::query_as!(
        Block,
        r#"
        SELECT id, course_id, block_type, week_day, start_time, end_time, location
        FROM blocks
        WHERE user_id = $1
        ORDER BY
            week_day ASC,
            start_time ASC
        "#,
        user_id
    )
    .fetch_all(pool)
    .await?;

    Ok(blocks)
}

pub async fn clone_blocks(
    pool: &PgPool,
    origin_course_id: &Uuid,
    target_course_id: &Uuid,
    target_user_id: &Uuid,
) -> Result<Vec<Block>, QueryError> {
    // get all the blocks from the origin course,
    let origin_blocks = sqlx::query_as!(
        Block,
        r#"
        SELECT id, course_id, block_type, week_day, start_time, end_time, location
        FROM blocks
        WHERE course_id = $1
        "#,
        origin_course_id
    )
    .fetch_all(pool)
    .await?;

    let mut blocks: Vec<Block> = Vec::new();

    // recreate them in the target course with the target user
    for origin_block in &origin_blocks {
        let new_block = create_block(
            pool,
            target_user_id,
            target_course_id,
            &origin_block.block_type,
            &origin_block.week_day,
            &origin_block.start_time,
            &origin_block.end_time,
            &origin_block.location,
        )
        .await?;
        blocks.push(new_block);
    }

    Ok(blocks)
}
