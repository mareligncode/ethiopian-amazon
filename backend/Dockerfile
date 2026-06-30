FROM golang:1.24-bookworm AS builder
WORKDIR /app

# RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Change your build line to include these env variables:
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/main .
COPY --from=builder /app/.env .

EXPOSE 8082

CMD ["./main"]