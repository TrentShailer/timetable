use std::cmp::Ordering;
use std::collections::HashMap;

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
    /// The column that a block with that uuid belongs to in order to display clashes correctly.
    block_columns: HashMap<Uuid, u8>,
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

    let block_columns = compute_block_columns(&blocks);

    let response = TimetableResponse {
        courses,
        blocks,
        block_columns,
    };

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

fn compute_block_columns(blocks: &[Block]) -> HashMap<Uuid, u8> {
    // compute map between uuid and block for faster searches
    let block_map = blocks
        .iter()
        .map(|block| (block.id, block))
        .collect::<HashMap<Uuid, &Block>>();

    let mut clash_map: HashMap<Uuid, Vec<Uuid>> = HashMap::with_capacity(blocks.len());

    // compute clash map
    blocks.iter().for_each(|block| {
        let clashes = blocks
            .iter()
            .filter_map(|other| {
                if other.week_day != block.week_day || other.id == block.id {
                    return None;
                }

                let start_cmp = block.start_time.cmp(&other.start_time);
                let end_cmp = block.start_time.cmp(&other.end_time);

                if (start_cmp == Ordering::Greater || start_cmp == Ordering::Equal)
                    && (end_cmp == Ordering::Less)
                {
                    return Some(other.id);
                }

                None
            })
            .collect();

        clash_map.insert(block.id, clashes);
    });

    let mut block_columns: HashMap<Uuid, u8> = HashMap::with_capacity(blocks.len());

    blocks.iter().for_each(|block| {
        // if we have already found this blocks column, skip it
        if block_columns.contains_key(&block.id) {
            return;
        }

        compute_columns(block, &block_map, &clash_map, &mut block_columns);
    });

    block_columns
}

fn compute_columns(
    block: &Block,
    block_map: &HashMap<Uuid, &Block>,
    clash_map: &HashMap<Uuid, Vec<Uuid>>,
    block_columns: &mut HashMap<Uuid, u8>,
) {
    if block_columns.contains_key(&block.id) {
        return;
    }

    let clashes = clash_map.get(&block.id).unwrap();

    if clashes.len() == 0 {
        block_columns.insert(block.id, 0);
        return;
    }

    // compute the column for each clash
    let taken_columns: Vec<u8> = clashes
        .iter()
        .map(|clash| {
            // fix issue with clash with eachother,
            // if two blocks clash with eachother, then resolve it by ignoring one of the blocks and let it work itself out
            if clash_map.get(clash).unwrap().contains(&block.id)
                && !block_columns.contains_key(clash)
            {
                return u8::MAX;
            }

            compute_columns(
                block_map.get(clash).unwrap(),
                block_map,
                clash_map,
                block_columns,
            );
            block_columns.get(clash).unwrap().to_owned()
        })
        .collect();

    let index = match (0..u8::MAX).find(|index| !taken_columns.contains(&index)) {
        Some(v) => v,
        None => 0,
    };

    block_columns.insert(block.id, index);
}

#[cfg(test)]
mod test {
    use std::collections::HashMap;

    use chrono::NaiveTime;
    use uuid::Uuid;

    use crate::{routes::timetable::compute_block_columns, types::Block};

    fn create_block(week_day: i16, start_time: NaiveTime, end_time: NaiveTime) -> Block {
        Block {
            week_day,
            start_time,
            end_time,
            id: Uuid::new_v4(),
            course_id: Uuid::new_v4(),
            block_type: "".to_string(),
            location: "".to_string(),
            notes: None,
        }
    }

    #[test]
    fn compute_columns_test_1() {
        let a = create_block(
            0,
            NaiveTime::from_hms_opt(0, 0, 0).unwrap(),
            NaiveTime::from_hms_opt(1, 0, 0).unwrap(),
        );
        let b = create_block(
            0,
            NaiveTime::from_hms_opt(0, 30, 0).unwrap(),
            NaiveTime::from_hms_opt(1, 30, 0).unwrap(),
        );
        let c = create_block(
            0,
            NaiveTime::from_hms_opt(0, 45, 0).unwrap(),
            NaiveTime::from_hms_opt(1, 45, 0).unwrap(),
        );
        let d = create_block(
            0,
            NaiveTime::from_hms_opt(1, 40, 0).unwrap(),
            NaiveTime::from_hms_opt(2, 40, 0).unwrap(),
        );

        let mut expected_result = HashMap::new();
        expected_result.insert(a.id, 0);
        expected_result.insert(b.id, 1);
        expected_result.insert(c.id, 2);
        expected_result.insert(d.id, 0);

        let blocks = vec![b, a, d, c];

        assert_eq!(compute_block_columns(&blocks), expected_result)
    }

    #[test]
    fn compute_columns_test_2() {
        let a = create_block(
            0,
            NaiveTime::from_hms_opt(0, 0, 0).unwrap(),
            NaiveTime::from_hms_opt(2, 0, 0).unwrap(),
        );
        let b = create_block(
            0,
            NaiveTime::from_hms_opt(0, 30, 0).unwrap(),
            NaiveTime::from_hms_opt(1, 30, 0).unwrap(),
        );
        let c = create_block(
            0,
            NaiveTime::from_hms_opt(0, 45, 0).unwrap(),
            NaiveTime::from_hms_opt(1, 45, 0).unwrap(),
        );
        let d = create_block(
            0,
            NaiveTime::from_hms_opt(1, 40, 0).unwrap(),
            NaiveTime::from_hms_opt(2, 40, 0).unwrap(),
        );

        let mut expected_result = HashMap::new();
        expected_result.insert(a.id, 0);
        expected_result.insert(b.id, 1);
        expected_result.insert(c.id, 2);
        expected_result.insert(d.id, 1);

        let blocks = vec![b, a, d, c];

        assert_eq!(compute_block_columns(&blocks), expected_result)
    }
}
