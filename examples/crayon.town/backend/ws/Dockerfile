FROM golang:1.23-alpine as go-build

WORKDIR /build

COPY ws/go.* ./ws/
COPY shared/go.* ./shared/

WORKDIR /build/ws/

RUN go mod download

WORKDIR /build

COPY ./shared/ ./shared/
COPY ./ws/ ./ws/

WORKDIR /build/ws/

ENV GOCACHE=/root/.cache/go-build
RUN --mount=type=cache,target="/root/.cache/go-build" GOOS=linux go build

FROM scratch
WORKDIR /app
COPY --from=go-build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=go-build /build/ws/ws ws

CMD ["/app/ws"]
