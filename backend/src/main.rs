use axum::error_handling::HandleErrorLayer;
use axum::http::header::{ACCEPT, ACCEPT_LANGUAGE, CONTENT_LANGUAGE, CONTENT_TYPE, RANGE};
use axum::http::{Method, StatusCode};
use axum::routing::{delete, get, post, put};
use axum::{BoxError, Router};
use log::info;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::net::SocketAddr;
use std::time::Duration;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tower_sessions::{ExpiredDeletion, Expiry, PostgresStore, SessionManagerLayer};

mod types;

mod utils;

mod error;

mod routes;
use routes::auth::*;
use routes::block::*;
use routes::course::*;
use routes::session::*;
use routes::timetable::*;
use routes::user_data::*;

pub const SESSION_USER_KEY: &str = "user_id";

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    pretty_env_logger::init();
    match dotenvy::dotenv() {
        Ok(_) => {}
        Err(_) => info!("No .env file"),
    };

    let db_uri = std::env::var("DATABASE_URL")?;

    // Setup connection pool
    let pool = PgPoolOptions::new()
        .max_connections(20)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&db_uri)
        .await?;

    let (router, session_store) = create_router(pool.clone()).await?;

    let deletion_task = tokio::task::spawn(
        session_store
            .clone()
            .continuously_delete_expired(tokio::time::Duration::from_secs(60)),
    );

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    info!("listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(router.into_make_service())
        .await?;

    deletion_task.await??;
    Ok(())
}

async fn create_router(pool: PgPool) -> anyhow::Result<(Router, PostgresStore)> {
    let origin_url = std::env::var("ORIGIN_URL").expect(".env must contain ORIGIN_URL");
    let origins = [
        "http://localhost:3000".parse().unwrap(),
        origin_url.parse().unwrap(),
    ];

    let cors = CorsLayer::new()
        .allow_origin(origins)
        .allow_headers([
            ACCEPT,
            ACCEPT_LANGUAGE,
            CONTENT_LANGUAGE,
            CONTENT_TYPE,
            RANGE,
        ])
        .allow_methods([
            Method::POST,
            Method::GET,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_credentials(true);

    let session_store = PostgresStore::new(pool.clone());
    session_store.migrate().await?;

    let router = build_router(cors, &session_store, pool).await;

    Ok((router, session_store))
}

async fn build_router(cors: CorsLayer, session_store: &PostgresStore, pool: PgPool) -> Router {
    let session_service = ServiceBuilder::new()
        .layer(HandleErrorLayer::new(|_: BoxError| async {
            StatusCode::BAD_REQUEST
        }))
        .layer(
            SessionManagerLayer::new(session_store.clone())
                .with_secure(false)
                .with_expiry(Expiry::OnInactivity(time::Duration::days(30)))
                .with_name("session_id"),
        );

    Router::new()
        .route("/course", post(route_post_course))
        .route("/course/import", post(route_post_import_course))
        .route("/course/:course_id", get(route_get_course))
        .route("/course/:course_id", put(route_put_course))
        .route("/course/:course_id", delete(route_delete_course))
        .route("/course/:course_id/block", post(route_post_block))
        .route("/course/:course_id/block/:block_id", get(route_get_block))
        .route("/course/:course_id/block/:block_id", put(route_put_block))
        .route(
            "/course/:course_id/block/:block_id",
            delete(route_delete_block),
        )
        .route("/timetable", get(route_get_timetable))
        .route("/timetable", delete(route_delete_timetable))
        .route("/session", get(route_get_session))
        .route("/session", delete(route_delete_session))
        .route("/user_data", get(route_get_user_data))
        .route("/user_data", delete(route_delete_user_data))
        .route("/auth/google", post(route_post_auth_google))
        .layer(cors)
        .layer(session_service)
        .with_state(pool)
}
