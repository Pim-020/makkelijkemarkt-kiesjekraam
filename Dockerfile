# build environment
FROM node:13.12.0-alpine as build
ARG PUBLIC_URL=/bewerkdemarkten

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@4.0.0 -g --silent
COPY . ./
COPY ./src/services/configuration_template.ts /app/src/services/configuration.ts
COPY ./nginx.conf /etc/nginx/nginx.conf
RUN sed -i "s|__MMARKT_URL__|${PUBLIC_URL}/data/mmarkt.json|g" /app/src/services/configuration.ts
RUN cat /app/src/services/configuration.ts

RUN npm run build

# production environment
FROM nginx:1.18.0-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY /mmarkt_import.sh /mmarkt_import.sh
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
