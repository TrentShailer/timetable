use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use log::error;

#[derive(thiserror::Error, Debug)]
pub enum QueryError {
    #[error("Unique violation: {0}")]
    UniqueViolation(sqlx::Error),
    #[error("Not null violation: {0}")]
    NotNullViolation(sqlx::Error),
    #[error("Foreign key violation: {0}")]
    ForeignKeyViolation(sqlx::Error),
    #[error("Check violation: {0}")]
    CheckViolation(sqlx::Error),
    #[error("Owner violation")]
    OwnerViolation,
    #[error("Database error: {0}")]
    OtherError(sqlx::Error),
}

impl QueryError {
    fn status_code(&self) -> StatusCode {
        match self {
            Self::UniqueViolation(_) => StatusCode::CONFLICT,
            Self::NotNullViolation(_) | Self::CheckViolation(_) => StatusCode::BAD_REQUEST,
            Self::ForeignKeyViolation(_) => StatusCode::UNAUTHORIZED,
            Self::OwnerViolation => StatusCode::FORBIDDEN,
            Self::OtherError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl From<sqlx::Error> for QueryError {
    fn from(error: sqlx::Error) -> Self {
        match error {
            sqlx::Error::Database(error) => match error.kind() {
                sqlx::error::ErrorKind::UniqueViolation => {
                    Self::UniqueViolation(sqlx::Error::Database(error))
                }
                sqlx::error::ErrorKind::NotNullViolation => {
                    Self::NotNullViolation(sqlx::Error::Database(error))
                }
                sqlx::error::ErrorKind::ForeignKeyViolation => {
                    Self::ForeignKeyViolation(sqlx::Error::Database(error))
                }
                sqlx::error::ErrorKind::CheckViolation => {
                    Self::CheckViolation(sqlx::Error::Database(error))
                }
                _ => Self::OtherError(sqlx::Error::Database(error)),
            },
            other => Self::OtherError(other),
        }
    }
}

#[derive(thiserror::Error, Debug)]
pub enum AppError {
    #[error("Query Error: {0}")]
    QueryError(#[from] QueryError),
    #[error("Error: {0}")]
    Anyhow(#[from] anyhow::Error),
    #[error(transparent)]
    SessionError(#[from] tower_sessions::session::Error),
}

impl AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            Self::Anyhow(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::SessionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::QueryError(error) => error.status_code(),
        }
    }
}

// Tell axum how to convert `AppError` into a response.
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        error!("{}", self.to_string());

        return self.status_code().into_response();
    }
}
