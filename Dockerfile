from node:18-alpine

ENV BACKEND_PORT=8081
EXPOSE 8081/tcp
WORKDIR /app
CMD (cd home && npm install) && \
		(cd home/frontend && npm install) && \
		(cd home && npm run serve)