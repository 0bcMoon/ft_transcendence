all: up

up:
	docker compose up -d --build

down:
	docker compose down -v

restart: down up

clean:
	docker compose down --rmi all --volumes --remove-orphans

logs:
	docker compose logs -f

ps:
	docker compose ps

