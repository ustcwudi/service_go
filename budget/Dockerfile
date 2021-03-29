FROM golang:alpine AS builder

WORKDIR /
RUN apk update && \
    apk add git nodejs npm && \
    git clone --depth=1 https://github.com/ustcwudi/service

WORKDIR /service/web/src
RUN mv extra/budget/ pages/main/

WORKDIR /service/tool
RUN go run main.go budget

WORKDIR /service/budget
RUN go mod download && \
    go get -u github.com/swaggo/swag/cmd/swag && \
    swag init -g service.go && \
    CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -a -o service .

WORKDIR /service/web
RUN npm install && npm run build

FROM alpine:latest AS final
RUN apk update && \
    apk add nginx vsftpd && \
    mkdir -p /run/nginx

WORKDIR /app
COPY --from=builder /service/budget/entrypoint.sh .
COPY --from=builder /service/budget/service .
COPY --from=builder /service/budget/service.yml .
COPY --from=builder /service/budget/vsftpd.conf .
COPY --from=builder /service/budget/template/ ./template/
COPY --from=builder /service/budget/docs/ ./docs/
COPY --from=builder /service/budget/static/ ./static/
COPY --from=builder /service/web/dist/ ./admin/
COPY --from=builder /service/budget/nginx.conf /etc/nginx/conf.d/default.conf

LABEL com.centurylinklabs.watchtower.enable="true"

CMD sh /app/entrypoint.sh
