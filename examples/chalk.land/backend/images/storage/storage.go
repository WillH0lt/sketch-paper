package storage

// func uploadFile(ctx context.Context, wg *sync.WaitGroup, bucket *storage.BucketHandle, object, filePath string) error {
// 	defer wg.Done() // Signal the wait group that this goroutine is done after the function returns.

// 	// Open local file.
// 	f, err := os.Open(filePath)
// 	if err != nil {
// 		return fmt.Errorf("os.Open: %v", err)
// 	}
// 	defer f.Close()

// 	// Upload file to bucket.
// 	wc := bucket.Object(object).NewWriter(ctx)

// 	wc.CacheControl = "public, max-age=31536000" // 1 year
// 	if _, err = io.Copy(wc, f); err != nil {
// 		return fmt.Errorf("io.Copy: %v", err)
// 	}
// 	if err := wc.Close(); err != nil {
// 		return fmt.Errorf("Writer.Close: %v", err)
// 	}
// 	return nil
// }

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/png"

	"cloud.google.com/go/storage"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/config"
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

	wc := bucket.Object(imageName).NewWriter(ctx)
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
