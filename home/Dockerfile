from node:18-alpine

ENV BACKEND_PORT=8081
EXPOSE 8081/tcp
WORKDIR /app
CMD npm install && \
		(cd frontend && npm install) && \
		npm run serve