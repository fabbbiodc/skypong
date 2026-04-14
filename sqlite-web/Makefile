COMPOSE_FILE=docker-compose-sqlite.yml
SERVICE=sqlite-web-demo

.PHONY: default all build up down restart clean logs help

# --- Default target ---
default: help

# --- Build + Up ---
all: help build up

# --- Build the Docker image ---
build:
	docker compose -f $(COMPOSE_FILE) build

# --- Start the container in detached mode ---
up:
	docker compose -f $(COMPOSE_FILE) up -d

# --- Stop the container ---
down:
	docker compose -f $(COMPOSE_FILE) down

# --- Restart container ---
restart: down up

# --- Remove container and image completely (only for this service) ---
clean: down
	-docker rm -f $(SERVICE) || true
	-docker rmi $(SERVICE) || true
	-docker volume ls -q --filter name=$(SERVICE) | xargs -r docker volume rm

# --- Show logs ---
logs:
	docker compose -f $(COMPOSE_FILE) logs -f

# --- Help target ---
help:
	@echo ""
	@echo "Targets for sqlite-web-demo:"
	@echo "  make        -> Show this help"
	@echo "  make all    -> Show help + build and start container"
	@echo "  make build  -> Build the sqlite-web-demo image"
	@echo "  make up     -> Start the sqlite-web-demo container (detached)"
	@echo "  make down   -> Stop the sqlite-web-demo container"
	@echo "  make restart -> Restart the sqlite-web-demo container"
	@echo "  make clean  -> Stop and remove container + image + volumes (only for sqlite-web-demo)"
	@echo "  make logs   -> Follow logs of sqlite-web-demo"
	@echo "  make help   -> Show this help message"
	@echo ""
