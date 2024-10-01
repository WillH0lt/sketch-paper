FROM golang:1.23-alpine as go-build

WORKDIR /build

COPY cleaner/go.* ./cleaner/

WORKDIR /build/cleaner/

RUN go mod download

WORKDIR /build

COPY ./cleaner/ ./cleaner/

WORKDIR /build/cleaner/

ENV GOCACHE=/root/.cache/go-build
RUN --mount=type=cache,target="/root/.cache/go-build" GOOS=linux go build

FROM scratch

WORKDIR /app
COPY --from=go-build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=go-build /build/cleaner /app

CMD ["/app/cleaner"]
