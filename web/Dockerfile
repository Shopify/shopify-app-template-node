FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
EXPOSE 8081/tcp
WORKDIR /app
COPY . .
RUN rm -rf node_modules && npm install
RUN cd frontend && rm -rf dist && npm run build
CMD npm run serve
