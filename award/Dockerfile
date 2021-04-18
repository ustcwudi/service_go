FROM golang:alpine AS builder

WORKDIR /
RUN apk update && \
    apk add git nodejs npm && \
    git clone --depth=1 https://github.com/ustcwudi/service

WORKDIR /service/web/src
RUN mv extra/award/ pages/main/

WORKDIR /service/tool
RUN go run main.go award

WORKDIR /service/award
RUN go get -u github.com/swaggo/swag/cmd/swag && \
    swag init -g service.go && \
    go mod tidy && go mod download && \
    CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -a -o service .

WORKDIR /service/web
RUN npm install && npm run build

FROM nginx:alpine AS final

WORKDIR /app
COPY --from=builder /service/award/service .
COPY --from=builder /service/award/service.yml .
COPY --from=builder /service/award/template/ ./template/
COPY --from=builder /service/award/docs/ ./docs/
COPY --from=builder /service/award/static/ ./static/
COPY --from=builder /service/web/dist/ ./admin/
COPY --from=builder /service/award/conf/nginx.conf /etc/nginx/conf.d/default.conf

LABEL com.centurylinklabs.watchtower.enable="true"

CMD nohup sh -c 'nginx && /app/service'