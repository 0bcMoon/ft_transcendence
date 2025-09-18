all: init

up:
	docker-compose up -d --build
down:
	docker-compose down
clean:
	docker-compose down --rmi all --volumes --remove-orphans
fclean:
	docker system prune -a --volumes

init:
	cd backend && npm install
	cd frontend && npm install
	
