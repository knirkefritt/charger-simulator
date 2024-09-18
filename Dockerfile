FROM node:alpine
COPY . .
RUN yarn install\
    && yarn global add typescript
RUN yarn run tsc
ENTRYPOINT [ "node", "./dist/chargerSimulatorCli.js" ]
