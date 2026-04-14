SHELL := /bin/bash

# Usa docker compose (plugin). Si tú usas docker-compose legacy, cambia a "docker-compose"
DC := docker compose
COMPOSE_FILE := docker-compose.yml
COMPOSE_TEMPLATE := docker-compose-template.yml
CONFIG_PATH := config_docker_path.sh

# Nombre del proyecto (para agrupar recursos). Opcional.
PROJECT ?= transcendence

# Common flags
DCFLAGS := -p $(PROJECT) -f $(COMPOSE_FILE)

.PHONY: help up down restart ps logs build rebuild pull \
        clean clean-hard prune-volumes prune-images prune-all \
        exec-nginx exec-auth exec-game exec-game-front all hall buildup 

help:
	@echo ""
	@echo "Targets:"
	@echo "  make up             -> Levanta stack (detached)"
	@echo "  make down           -> Baja stack"
	@echo "  make restart        -> Reinicia stack"
	@echo "  make ps             -> Estado de contenedores"
	@echo "  make logs           -> Logs follow de todo"
	@echo "  make build          -> Build de imágenes"
	@echo "  make rebuild        -> Build sin cache y up"
	@echo "  make pull           -> Pull de imágenes (si aplica)"
	@echo ""
	@echo "Limpieza:"
	@echo "  make clean          -> down + remove orphans (NO borra volúmenes)"
	@echo "  make clean-hard     -> down -v + remove orphans (BORRA volúmenes: datos)"
	@echo "  make prune-images   -> limpia imágenes dangling/unused"
	@echo "  make prune-volumes  -> limpia volúmenes sin uso (peligroso)"
	@echo "  make prune-all      -> system prune (peligroso)"
	@echo ""
	@echo "Exec:"
	@echo "  make exec-nginx     -> shell dentro de nginx-gateway"
	@echo "  make exec-auth      -> shell dentro de auth-service"
	@echo "  make exec-game      -> shell dentro de game-service"
	@echo "  make exec-game-front -> shell dentro de game-frontend"
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

# Limpio "normal": no te borra datos persistidos
clean:
	$(DC) $(DCFLAGS) down --remove-orphans
	rm -v $(COMPOSE_FILE)
	docker volume prune -f

# Limpio "hard": borra volúmenes (pierdes SQLite, Prometheus, Grafana, etc.)
clean-hard:
	$(DC) $(DCFLAGS) down -v --remove-orphans
	rm -Rvf ./volumes/*

# Prunes (ojo: globales, no solo tu proyecto)
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
