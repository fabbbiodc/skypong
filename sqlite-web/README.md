# SQLite Web Viewer Service

A lightweight containerized service that exposes SQLite databases through a browser-based UI.

This tool is primarily intended for **development and debugging environments**, allowing developers to inspect and query application databases without installing local database clients.

The service automatically discovers SQLite database files and exposes them via a web interface.

---

# Purpose

The SQLite Web Viewer provides:

- browser-based database inspection
- quick debugging of development databases
- visibility into seed and runtime data
- simple SQL query execution

It is particularly useful when working with containerized environments where accessing database files directly can be inconvenient.

---

# Overview

The service scans a mounted directory for SQLite database files (`*.db`) and launches a web interface using **sqlite-web**.

Detected databases are automatically loaded and made accessible through the UI.

```
           +-----------------------+
           |  SQLite Web Viewer    |
           |       Container       |
           +-----------+-----------+
                       |
                       ▼
                 /data directory
                       |
        ---------------------------------
        |               |               |
        ▼               ▼               ▼
      auth.db        profile.db     statistics.db
```

The service can display **multiple databases simultaneously**.

---

# Technologies

| Technology           | Purpose                                     |
|----------------------|---------------------------------------------| 
| Python 3.12 (Alpine) | Runtime environment                         |
| sqlite-web           | Web UI for SQLite databases                 |
| Flask                | Underlying web framework used by sqlite-web |
| Docker               | Containerized execution                     |

---

# Architecture

The service consists of two main components:

```
Dockerfile
start.sh
```

## Dockerfile

Defines a minimal container environment with:

- Python runtime
- sqlite-web
- Flask dependency

```
FROM python:3.12-alpine

RUN apk add --no-cache bash netcat-openbsd ca-certificates

RUN pip install --no-cache-dir sqlite-web==0.7.1 flask==2.3.3

WORKDIR /app
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]
```

---

## start.sh

Startup script responsible for:

1. discovering SQLite databases
2. building a list of database files
3. launching the web interface

### Database discovery

The script scans the `/data` directory recursively:

```
find "$DATA_DIR" -type f -name "*.db"
```

All discovered databases are added to a launch list.

### Validation

If no databases are found, the container exits with an error:

```
There is no database in /data
```

### Launch

The script starts sqlite-web with all discovered databases:

```
sqlite_web --host=0.0.0.0 --port=$PORT <databases>
```

---

# Environment Variables

| Variable | Default | Description        |
|----------|---------|--------------------|
| PORT     | 8080    | Web interface port |

Example:

```
PORT=9000
```

---

# Directory Structure

```
sqlite-web/
│
├── docker-compose-sqlite.yml
├── Dockerfile
├── Makefile
├── README.md
└── start.sh
```

---

# Data Mount

The container expects SQLite databases to be available in:

```
/data
```

This directory is typically mounted from the host or another container.

Example:

```
/data/auth-data/auth.db
/data/profile-data/profile.db
/data/stats-data/statistics.db
```

---

# Running the Service

## Build the image

```
docker build -t sqlite-viewer .
```

---

## Run the container

```
make all
```

---

# Example Output

When the service starts:

```
Starting sqlite-web on 8080 for databases:
/data/auth-data/auth.db
/data/profile-data/profile.db
/data/stats-data/statistics.db
```

The web interface will then be available at:

```
http://localhost:8978
password required
```

---

# Features

The web interface allows developers to:

- browse database tables
- execute SQL queries
- view table schemas
- inspect indexes
- edit records (optional)
- export query results

---

# Typical Use Case

This service is often used together with:

- authentication service
- profile service
- statistics service
- database seed service

Example development stack:

```
+---------------------+
|    Backend APIs     |
+----------+----------+
           |
           ▼
     SQLite Databases
           |
           ▼
+---------------------+
| SQLite Web Viewer   |
+---------------------+
```

This allows developers to inspect the database state while the application is running.

---

# Security Note

This service **is not intended for production environments**.

The sqlite-web interface provides unrestricted access to the databases and should only be used in:

- development
- staging
- local testing environments

---

# Future Improvements

Possible enhancements:

- authentication layer
- read-only mode
- database filtering
- configurable data directory
- Docker Compose integration
