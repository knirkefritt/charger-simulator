FROM node:alpine
COPY . .
RUN npm install \
    && npm install -g typescript
RUN npx tsc
ENTRYPOINT [ "node", "./dist/chargerSimulatorCli.js" ]

