package storage

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/png"
	"time"

	"cloud.google.com/go/storage"
	"github.com/googleapis/gax-go/v2"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/cleaner/config"
	"google.golang.org/api/option"
)

var client *storage.Client

func Init() *storage.Client {

	conf := config.GetConfig()

	opt := option.WithCredentialsFile(conf.ServiceAccount)
	c, err := storage.NewClient(context.Background(), opt)
	if err != nil {
		panic(fmt.Sprintf("failed to create storage client: %v", err))
	}

	client = c

	return client
}

func SaveImage(ctx context.Context, imageName string, img image.Image) error {

	c := config.GetConfig()

	var imageBuf bytes.Buffer
	if err := png.Encode(&imageBuf, img); err != nil {
		return err
	}

	bucket := client.Bucket(c.BucketName)

	timeoutCtx, cancel := context.WithTimeout(ctx, 500*time.Second)
	defer cancel()

	wc := bucket.Object(imageName).Retryer(
		// Use WithBackoff to control the timing of the exponential backoff.
		storage.WithBackoff(gax.Backoff{
			// Set the initial retry delay to a maximum of 2 seconds. The length of
			// pauses between retries is subject to random jitter.
			Initial: 2 * time.Second,
			// Set the maximum retry delay to 60 seconds.
			Max: 60 * time.Second,
			// Set the backoff multiplier to 3.0.
			Multiplier: 3,
		}),
		// Use WithPolicy to customize retry so that all requests are retried even
		// if they are non-idempotent.
		storage.WithPolicy(storage.RetryAlways),
	).NewWriter(timeoutCtx)
	wc.CacheControl = "no-cache, max-age=0"

	if err := png.Encode(wc, img); err != nil {
		return err
	}

	if err := wc.Close(); err != nil {
		return err
	}

	return nil
}

func GetImage(ctx context.Context, imageName string) (*image.RGBA, error) {
	c := config.GetConfig()
	fileRef := client.Bucket(c.BucketName).Object(imageName)

	fmt.Printf("fileRef: %v\n", fileRef)

	reader, err := fileRef.NewReader(ctx)
	if err != nil {
		return nil, err
	}

	defer reader.Close()

	img, err := png.Decode(reader)
	if err != nil {
		return nil, err
	}

	return img.(*image.RGBA), nil
}
