# Build backend
FROM golang:1.17-alpine3.14 AS backend-builder
WORKDIR /go/src/github.com/artifacthub/hub
COPY go.* ./
COPY cmd/hub cmd/hub
COPY internal internal
WORKDIR /go/src/github.com/artifacthub/hub/cmd/hub
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /hub .

# Build frontend
FROM node:14-alpine3.14 AS frontend-builder
RUN apk --no-cache add jq
WORKDIR /web
COPY web .
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN yarn install
RUN yarn build
# Generate a yarn.lock version that does not contain the dev dependencies
RUN cp -R /web/node_modules /web/package.json /web/yarn.lock /tmp
WORKDIR /tmp
RUN cat package.json | jq 'del(.devDependencies)' > tmp && mv tmp package.json
RUN yarn install

# Build widget
FROM node:14-alpine3.14 AS widget-builder
WORKDIR /widget
COPY widget .
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN yarn install
RUN yarn build

# Build docs
FROM klakegg/hugo:0.78.2 AS docs-builder
WORKDIR /
COPY scripts scripts
COPY docs docs
RUN scripts/prepare-docs.sh
WORKDIR /docs/www
RUN hugo

# Final stage
FROM alpine:3.14
RUN apk --no-cache add ca-certificates && addgroup -S hub && adduser -S hub -G hub
USER hub
WORKDIR /home/hub
COPY --from=backend-builder /hub ./
COPY --from=frontend-builder /web/build ./web
COPY --from=frontend-builder /tmp/yarn.lock ./web
COPY --from=widget-builder /widget/build ./widget
COPY --from=docs-builder /web/build/docs ./web/docs
COPY --from=docs-builder /docs/api ./web/docs/api
CMD ["./hub"]
EXPOSE 8000
