use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    error::QueryError,
    types::{Block, Course},
};

use super::blocks::clone_blocks;

#[derive(Serialize)]
pub struct ClonedCourse {
    course: Course,
    blocks: Vec<Block>,
}

pub async fn course_exists(pool: &PgPool, course_id: &Uuid) -> Result<bool, QueryError> {
    let course = sqlx::query!("SELECT id FROM courses WHERE id = $1", course_id)
        .fetch_optional(pool)
        .await?;

    match course {
        Some(_) => Ok(true),
        None => Ok(false),
    }
}

pub async fn clone_course(
    pool: &PgPool,
    id: &Uuid,
    new_user_id: &Uuid,
) -> Result<Option<ClonedCourse>, QueryError> {
    let maybe_origin_course =
        sqlx::query_as!(Course, r#"SELECT id, name FROM courses WHERE id = $1"#, id)
            .fetch_optional(pool)
            .await?;

    let origin_course = match maybe_origin_course {
        Some(course) => course,
        None => return Ok(None),
    };

    let target_course = create_course(pool, &new_user_id, &origin_course.name).await?;

    let blocks = clone_blocks(pool, &origin_course.id, &target_course.id, new_user_id).await?;

    let cloned_course = ClonedCourse {
        course: target_course,
        blocks,
    };

    Ok(Some(cloned_course))
}

pub async fn create_course(
    pool: &PgPool,
    user_id: &Uuid,
    name: &String,
) -> Result<Course, QueryError> {
    let course = sqlx::query_as!(
        Course,
        r#"
        INSERT INTO courses (user_id, name)
        VALUES ($1, $2)
        RETURNING id, name
        "#,
        user_id,
        name,
    )
    .fetch_one(pool)
    .await?;

    Ok(course)
}

pub async fn update_course(
    pool: &PgPool,
    id: &Uuid,
    user_id: &Uuid,
    name: &String,
) -> Result<Option<Course>, QueryError> {
    let course = sqlx::query_as!(
        Course,
        r#"
        UPDATE courses
        SET name = $3
        WHERE id = $1 AND user_id = $2
        RETURNING id, name
        "#,
        id,
        user_id,
        name,
    )
    .fetch_optional(pool)
    .await?;

    match course {
        Some(course) => return Ok(Some(course)),
        None => {}
    };

    // If nothing was returned but the course does exist, then the user isn't the owner
    if course_exists(pool, id).await? {
        return Err(QueryError::OwnerViolation);
    }

    Ok(None)
}

pub async fn get_course(
    pool: &PgPool,
    id: &Uuid,
    user_id: &Uuid,
) -> Result<Option<Course>, QueryError> {
    let course = sqlx::query_as!(
        Course,
        r#"
        SELECT id, name
        FROM courses
        WHERE id = $1 AND user_id = $2
        "#,
        id,
        user_id
    )
    .fetch_optional(pool)
    .await?;

    match course {
        Some(course) => return Ok(Some(course)),
        None => {}
    };

    if course_exists(pool, id).await? {
        return Err(QueryError::OwnerViolation);
    }

    Ok(None)
}

pub async fn delete_course(
    pool: &PgPool,
    id: &Uuid,
    user_id: &Uuid,
) -> Result<Option<Course>, QueryError> {
    let course = sqlx::query_as!(
        Course,
        r#"
        DELETE FROM courses
        WHERE id = $1 AND user_id = $2
        RETURNING id, name
        "#,
        id,
        user_id
    )
    .fetch_optional(pool)
    .await?;

    match course {
        Some(course) => return Ok(Some(course)),
        None => {}
    };

    if course_exists(pool, id).await? {
        return Err(QueryError::OwnerViolation);
    }

    Ok(None)
}

pub async fn get_all_courses(pool: &PgPool, user_id: &Uuid) -> Result<Vec<Course>, QueryError> {
    let courses = sqlx::query_as!(
        Course,
        r#"
        SELECT id, name
        FROM courses
        WHERE user_id = $1
        "#,
        user_id
    )
    .fetch_all(pool)
    .await?;

    Ok(courses)
}

pub async fn delete_all_courses(pool: &PgPool, user_id: &Uuid) -> Result<(), QueryError> {
    sqlx::query!(
        r#"
        DELETE FROM courses
        WHERE user_id = $1
        "#,
        user_id
    )
    .execute(pool)
    .await?;

    Ok(())
}
