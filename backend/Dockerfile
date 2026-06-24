# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy everything first
COPY . .

# Download dependencies
RUN go mod download

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final stage
FROM alpine:latest

WORKDIR /root/

# Copy the Pre-built binary file from the previous stage
COPY --from=builder /app/main .
COPY --from=builder /app/.env .

# Expose port 8082
EXPOSE 8082

# Command to run the executable
CMD ["./main"]
