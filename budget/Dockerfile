FROM golang:alpine AS builder

WORKDIR /
RUN apk update && \
    apk add git nodejs npm && \
    git clone --depth=1 https://github.com/ustcwudi/service_go && \
    mv service_go service

WORKDIR /service/web/src
RUN mv extra/budget/ pages/main/

WORKDIR /service/tool
RUN go run main.go budget

WORKDIR /service/budget
RUN go install github.com/swaggo/swag/cmd/swag@latest && \
    swag init -g service.go && \
    go mod tidy && go mod download && \
    CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -a -o service .

WORKDIR /service/web
RUN npm install && npm run build

FROM alpine:latest AS final
RUN apk update && \
    apk add nginx vsftpd && \
    mkdir -p /run/nginx

WORKDIR /app
COPY --from=builder /service/budget/conf/entrypoint.sh .
COPY --from=builder /service/budget/service .
COPY --from=builder /service/budget/service.yml .
COPY --from=builder /service/budget/conf/vsftpd.conf .
COPY --from=builder /service/budget/template/ ./template/
COPY --from=builder /service/budget/docs/ ./docs/
COPY --from=builder /service/budget/static/ ./static/
COPY --from=builder /service/web/dist/ ./admin/
COPY --from=builder /service/budget/conf/nginx.conf /etc/nginx/conf.d/default.conf

LABEL com.centurylinklabs.watchtower.enable="true"

CMD sh /app/entrypoint.sh
