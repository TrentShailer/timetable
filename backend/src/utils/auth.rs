use serde::{Deserialize, Serialize};

// The user data we'll get back from Google.
#[derive(Debug, Serialize, Deserialize)]
pub struct GoogleUser {
    pub sub: String,
    pub picture: Option<String>,
    pub email: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GoogleToken {
    pub access_token: String,
    pub expires_in: i32,
    pub refresh_token: String,
    pub scope: String,
    pub token_type: String,
}

pub async fn get_google_token(code: &str) -> anyhow::Result<GoogleToken> {
    // Get an auth token from google
    let client_id = std::env::var("GOOGLE_OAUTH_CLIENT_ID")?;
    let client_secret = std::env::var("GOOGLE_OAUTH_CLIENT_SECRET")?;

    let params = [
        ("code", code),
        ("client_id", client_id.as_str()),
        ("client_secret", client_secret.as_str()),
        ("grant_type", "authorization_code"),
        ("redirect_uri", "postmessage"),
    ];

    let client = reqwest::Client::new();
    let response = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await?
        .json::<GoogleToken>()
        .await?;

    Ok(response)
}

pub async fn get_user_data_from_token(token: &str) -> anyhow::Result<GoogleUser> {
    let client = reqwest::Client::new();
    let user_data = client
        .get("https://www.googleapis.com/oauth2/v3/userinfo")
        .bearer_auth(token)
        .send()
        .await?
        .json::<GoogleUser>()
        .await?;

    Ok(user_data)
}
