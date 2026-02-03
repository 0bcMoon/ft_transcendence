all: dirs up 

dirs:
	mkdir -p database
	mkdir -p images

up:
	docker compose up -d --build

down:
	docker compose down -v

re: down up

clean:
	docker compose down --rmi all --volumes --remove-orphans

logs:
	docker compose logs -f

ps:
	docker compose ps

