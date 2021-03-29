FROM golang:alpine AS builder

RUN set -eux && sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
ENV GOPROXY https://goproxy.cn

WORKDIR /
RUN apk update && \
    apk add git nodejs npm && \
    git clone --depth=1 https://github.com/ustcwudi/service

WORKDIR /service/tool
RUN go run main.go core

WORKDIR /service/core
RUN go mod download && \
    go get -u github.com/swaggo/swag/cmd/swag && \
    swag init -g service.go && \
    CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -a -o service .

WORKDIR /service/web
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install && npm run build

FROM nginx:alpine AS final

WORKDIR /app
COPY --from=builder /service/core/service .
COPY --from=builder /service/core/service.yml .
COPY --from=builder /service/core/template/ ./template/
COPY --from=builder /service/core/docs/ ./docs/
COPY --from=builder /service/core/static/ ./static/
COPY --from=builder /service/web/dist/ ./admin/
COPY --from=builder /service/core/nginx.conf /etc/nginx/conf.d/default.conf

LABEL com.centurylinklabs.watchtower.enable="true"

CMD nohup sh -c 'nginx && /app/service'