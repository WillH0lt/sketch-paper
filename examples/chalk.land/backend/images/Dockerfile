FROM golang:1.23-alpine as go-build

WORKDIR /build

COPY images/go.* ./images/
COPY shared/go.* ./shared/

WORKDIR /build/images/

RUN go mod download

WORKDIR /build

COPY ./shared/ ./shared/
COPY ./images/ ./images/

WORKDIR /build/images/

ENV GOCACHE=/root/.cache/go-build
RUN --mount=type=cache,target="/root/.cache/go-build" GOOS=linux go build

FROM ubuntu:20.04

RUN apt-get update
RUN apt-get install -y wget
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

ENV TZ=America/Denver
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt-get install -y ./google-chrome-stable_current_amd64.deb

WORKDIR /app
COPY --from=go-build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=go-build /build/images/screenshotView/dist /app/screenshotView/dist
COPY --from=go-build /build/images/images /app/images

CMD ["/app/images"]
