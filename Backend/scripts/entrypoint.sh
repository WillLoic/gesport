#!/bin/bash
set -e

# Wait for database if DB_HOST is set
if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
    echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.5
    done
    echo "PostgreSQL is up and running!"
fi

# Wait for Redis if REDIS_HOST is set
if [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
    echo "Waiting for Redis at $REDIS_HOST:$REDIS_PORT..."
    while ! nc -z $REDIS_HOST $REDIS_PORT; do
      sleep 0.5
    done
    echo "Redis is up and running!"
fi

if [ -n "$SERVICE_NAME" ]; then
    cd "/app/src/services/$SERVICE_NAME"

    echo "Applying database migrations for service: $SERVICE_NAME..."
    python manage.py makemigrations --noinput || true
    python manage.py migrate --noinput

    PORT=${PORT:-8000}

    if [ "$SERVICE_NAME" = "messaging_notification" ] || [ "$USE_ASGI" = "true" ]; then
        echo "Starting Daphne ASGI server for $SERVICE_NAME on port $PORT..."
        exec daphne -b 0.0.0.0 -p "$PORT" "${SERVICE_NAME}.asgi:application"
    else
        echo "Starting Gunicorn WSGI server for $SERVICE_NAME on port $PORT..."
        exec gunicorn "${SERVICE_NAME}.wsgi:application" --bind "0.0.0.0:$PORT" --workers 2 --threads 4
    fi
else
    echo "No SERVICE_NAME specified, executing command: $@"
    exec "$@"
fi
