FROM rust:1.74 as builder
WORKDIR /usr/src/timetable-backend
COPY . .
ENV SQLX_OFFLINE true
RUN cargo install --path .
FROM debian:bookworm-slim
COPY --from=builder /usr/local/cargo/bin/timetable-backend /usr/local/bin/timetable-backend
EXPOSE 8080
CMD ["timetable-backend"]