from node:18-alpine

ENV BACKEND_PORT=8081
EXPOSE 8081/tcp
WORKDIR /app
CMD (cd web && npm install) && \
		(cd web/frontend && npm install) && \
		(cd web && npm run serve)