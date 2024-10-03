package main

import (
	"context"
	"os"

	"time"

	gcp "cloud.google.com/go/storage"
	"github.com/chromedp/chromedp"
	"github.com/gammazero/workerpool"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/cleaner/images"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/cleaner/redis"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/cleaner/storage"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/shared/models"

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

	storage.Init()
	rdb := redis.Init()
	defer rdb.Close()

	ctx, cancel := chromedp.NewContext(context.Background())
	if err := chromedp.Run(ctx); err != nil {
		panic(err)
	}
	defer cancel()

	pool := workerpool.New(1)

	iter := rdb.Scan(ctx, 0, "*", 0).Iterator()

	for iter.Next(ctx) {
		listName := iter.Val()
		imgFileName := listName + ".png"

		records, err := rdb.LRange(ctx, listName, 0, -1).Result()
		if err != nil {
			log.Error().Err(err).Msg("failed to get segments")
			continue
		}

		var segments models.DrawSegments
		for _, record := range records {
			var batch models.DrawSegments
			if err := batch.UnmarshalBinary([]byte(record)); err != nil {
				continue
			}
			segments = append(segments, batch...)
		}

		if len(segments) == 0 {
			continue
		}

		img, err := storage.GetImage(ctx, imgFileName)
		if err == gcp.ErrObjectNotExist {
			img = images.CreateBlank()
		} else if err != nil {
			log.Error().Err(err).Msg("failed to get image")
			continue
		}

		pool.Submit(func() {
			images.Draw(ctx, img, segments)

			if err := storage.SaveImage(ctx, imgFileName, img); err != nil {
				log.Error().Err(err).Msg("failed to save image")
			}

			if _, err := rdb.LTrim(ctx, listName, int64(len(records)), -1).Result(); err != nil {
				log.Error().Err(err).Msg("failed to trim list")
			}
		})
	}
	if err := iter.Err(); err != nil {
		log.Error().Err(err).Msg("redis iteration failed")
		return err
	}

	pool.StopWait()

	log.Info().Msg("done")

	return nil
}
