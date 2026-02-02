all: up

up:
	docker-compose up -d --build
down:
	docker-compose down
re: down  up

clean:
	docker-compose down --rmi all --volumes --remove-orphans
fclean: down
	docker system prune -a --volumes

init:
	cd backend && npm install
	cd frontend && npm install
	
