FROM node:16.16.0 AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . ./
RUN npm run build && ls -lart ./dist/src/

FROM scratch AS export-build
COPY --from=build /app/dist ./dist/
COPY --from=build /app/node_modules ./node_modules/