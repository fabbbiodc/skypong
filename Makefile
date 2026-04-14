SHELL := /bin/bash

# Use docker compose (plugin). If you use docker-compose legacy, change to "docker-compose"
DC := docker compose
COMPOSE_FILE := docker-compose.yml
COMPOSE_TEMPLATE := docker-compose-template.yml
CONFIG_PATH := config_docker_path.sh

# Project name (to group resources). Optional.
PROJECT ?= transcendence

# Common flags
DCFLAGS := -p $(PROJECT) -f $(COMPOSE_FILE)

.PHONY: help up down restart ps logs build rebuild pull \
        clean clean-hard prune-volumes prune-images prune-all \
        exec-nginx exec-auth exec-game exec-game-front all hall buildup 

help:
	@echo ""
	@echo "Targets:"
	@echo "  make up             -> Brings up stack (detached)"
	@echo "  make down           -> Brings down stack"
	@echo "  make restart        -> Restarts stack"
	@echo "  make ps             -> Container status"
	@echo "  make logs           -> Logs follow of everything"
	@echo "  make build          -> Build images"
	@echo "  make rebuild        -> Build without cache and up"
	@echo "  make pull           -> Pull images (if applicable)"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          -> down + remove orphans (DOES NOT delete volumes)"
	@echo "  make clean-hard     -> down -v + remove orphans (DELETES volumes: data)"
	@echo "  make prune-images   -> clean dangling/unused images"
	@echo "  make prune-volumes  -> clean unused volumes (dangerous)"
	@echo "  make prune-all      -> system prune (dangerous)"
	@echo ""
	@echo "Exec:"
	@echo "  make exec-nginx     -> shell inside nginx-gateway"
	@echo "  make exec-auth      -> shell inside auth-service"
	@echo "  make exec-game      -> shell inside game-service"
	@echo "  make exec-game-front -> shell inside game-frontend"
	@echo ""

config: env
	cp -v $(COMPOSE_TEMPLATE) $(COMPOSE_FILE)
	chmod 777 $(CONFIG_PATH)
	./$(CONFIG_PATH)
up:
	$(DC) $(DCFLAGS) up -d --remove-orphans

down:
	$(DC) $(DCFLAGS) down

restart: down up

all: clean config build up

hall: clean-hard config build up

buildup: build up

ps:
	$(DC) $(DCFLAGS) ps

logs:
	$(DC) $(DCFLAGS) logs -f --tail=200

build:
	$(DC) $(DCFLAGS) build

rebuild:
	$(DC) $(DCFLAGS) build --no-cache
	$(DC) $(DCFLAGS) up -d --remove-orphans

pull:
	$(DC) $(DCFLAGS) pull

# Normal cleanup: doesn't delete persisted data
clean:
	$(DC) $(DCFLAGS) down --remove-orphans
	rm -v $(COMPOSE_FILE)
	docker volume prune -f

# Hard cleanup: deletes volumes (you lose SQLite, Prometheus, Grafana, etc.)
clean-hard:
	$(DC) $(DCFLAGS) down -v --remove-orphans
	rm -Rvf ./volumes/*

# Prunes (warning: global, not just your project)
prune-images:
	docker image prune -f

prune-volumes:
	docker volume prune -f

prune-all:
	docker system prune -af --volumes

exec-nginx:
	$(DC) $(DCFLAGS) exec nginx-gateway sh

exec-auth:
	$(DC) $(DCFLAGS) exec auth-service sh

exec-game:
	$(DC) $(DCFLAGS) exec game-service sh

exec-game-front:
	$(DC) $(DCFLAGS) exec game-frontend sh

.PHONY: env

env:
	@if [ ! -f .env ]; then \
		echo "📄 Creating .env from .env.example"; \
		cp .env.example .env; \
	else \
		echo "✅ .env already exists"; \
	fi