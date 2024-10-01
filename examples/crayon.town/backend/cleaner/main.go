package main

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"time"

	"github.com/redis/go-redis/v9"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/cleaner/config"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/urfave/cli"
)

func init() {
	if os.Getenv("CLEANER_DEBUG") == "false" {
		zerolog.LevelFieldName = "severity"
		zerolog.TimestampFieldName = "timestamp"
		zerolog.TimeFieldFormat = time.RFC3339Nano
	} else {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}
}

func main() {
	app := cli.NewApp()
	app.Name = "cleaner"
	app.Action = run
	app.Run(os.Args)
}

func run(args *cli.Context) error {

	log.Info().Msg("starting!")

	c := config.GetConfig()

	ctx := context.Background()

	rdb := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%d", c.RedisHost, c.RedisPort),
		DB:   0,
	})

	defer rdb.Close()

	iter := rdb.Scan(ctx, 0, "*", 0).Iterator()

	for iter.Next(ctx) {
		listName := iter.Val()

		log.Info().Msgf("getting image: %s", listName)

		url := fmt.Sprintf("%s/v1/image/%s.png", c.ImagesUrl, listName)
		req, _ := http.NewRequest("GET", url, nil)
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Info().Msgf("failed to get image: %s", url)
			continue
		}
		defer resp.Body.Close()
	}
	if err := iter.Err(); err != nil {
		log.Error().Err(err).Msg("redis iteration failed")
		return err
	}

	log.Info().Msg("done")

	return nil
}
