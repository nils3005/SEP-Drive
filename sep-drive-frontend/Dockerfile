FROM node:22.14-slim AS build
WORKDIR /src
RUN npm install -g @angular/cli
COPY . ./
RUN npm ci
RUN ng build --configuration=development

FROM nginx:latest AS final
EXPOSE 80
COPY --from=build src/dist/sep-drive-frontend/browser  /usr/share/nginx/html
