module github.com/willH0lt/sketch-paper/examples/crayon.town/backend/cleaner

go 1.21

require (
	github.com/kelseyhightower/envconfig v1.4.0
	github.com/redis/go-redis/v9 v9.6.1
	github.com/rs/zerolog v1.31.0
	github.com/urfave/cli v1.22.14
)

require (
	github.com/cespare/xxhash/v2 v2.2.0 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.2 // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.19 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	golang.org/x/sys v0.12.0 // indirect
)

replace pixel.land/go/shared v0.0.0 => ../shared
