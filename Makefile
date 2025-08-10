all: init


init:
	cd backend && npm install
	cd frontend && npm install
	cd backend && npm run migrate
	
