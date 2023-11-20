create table if not exists users (
    id           UUID      primary key    default gen_random_uuid(),
    email        VARCHAR   not null unique,
    name         VARCHAR   not null,
    picture      VARCHAR,
    last_updated TIMESTAMP not null default now()
);
create table if not exists tokens (
    id            UUID      primary key   default gen_random_uuid(),
    user_id       UUID      not null unique references users (id) on delete cascade,
    token         VARCHAR   not null,
    expires_in    INT       not null,
    scope         VARCHAR   not null,
    refresh_token VARCHAR   not null,
    issued        TIMESTAMP not null default now()
);
create table if not exists courses (
    id      UUID    primary key default gen_random_uuid(),
    user_id UUID    not null references users (id) on delete cascade,
    name    VARCHAR not null
);
create table if not exists blocks (
    id         UUID     primary key default gen_random_uuid(),
    user_id    UUID     not null references users (id) on delete cascade,
    course_id  UUID     not null references courses (id) on delete cascade,
    block_type VARCHAR  not null,
    week_day   SMALLINT not null,
    start_time TIME     not null,
    end_time   TIME     not null,
    location   VARCHAR  not null
);
