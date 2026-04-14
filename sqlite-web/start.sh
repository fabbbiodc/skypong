#!/bin/sh

DATA_DIR="/data"
PORT="${PORT:-8080}"

PASSWORD="${SQLITE_WEB_PASSWORD:-admin}"

while true; do
    # Собираем список всех .db файлов
    DBS=""
    for db in $(find "$DATA_DIR" -type f -name "*.db"); do
        DBS="$DBS $db"
    done

    if [ -z "$DBS" ]; then
        echo "No database files found in $DATA_DIR"
    else
        echo "Starting sqlite-web on $PORT for databases: $DBS"
        sqlite_web \
          --host=0.0.0.0 \
          --port="$PORT" \
          --password "$PASSWORD" \
          --no-browser \
          $DBS
    fi

    echo "Restarting sqlite-web in 1 second..."
    sleep 1
done
