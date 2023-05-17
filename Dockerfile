FROM node:18-alpine

ARG SHOPIFY_APP_API_KEY
ENV SHOPIFY_APP_API_KEY=$SHOPIFY_APP_API_KEY
EXPOSE 8081
WORKDIR /app
COPY web .
RUN npm install
RUN cd frontend && npm install && npm run build
CMD ["npm", "run", "serve"]
