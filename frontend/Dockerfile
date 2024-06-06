FROM node:21.7.2-alpine as build

WORKDIR /opt/react
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ======
FROM nginx:1.27-alpine3.19-slim
ENV BACKEND_URL=http://backend:8080
COPY ./nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /opt/react/build/client /usr/share/nginx/html
EXPOSE 80