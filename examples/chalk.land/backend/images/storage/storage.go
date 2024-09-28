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
	"errors"
	"fmt"
	"image"
	"image/png"
	"os"

	"cloud.google.com/go/storage"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/config"
	"google.golang.org/api/option"
)

var client *storage.Client

func Init() *storage.Client {

	c := config.GetConfig()

	if _, err := os.Stat(c.ServiceAccount); err == nil {
		opt := option.WithCredentialsFile(c.ServiceAccount)
		client, err = storage.NewClient(context.Background(), opt)
		if err != nil {
			panic(fmt.Sprintf("failed to create storage client: %v", err))
		}
	} else if errors.Is(err, os.ErrNotExist) {
		client, err = storage.NewClient(context.Background())
		if err != nil {
			panic(fmt.Sprintf("failed to create storage client: %v", err))
		}
	} else {
		panic(fmt.Sprintf("failed to create storage client: %v", err))
	}

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

// func (s *Storage) SetMetadata(ctx context.Context, path string, metadata map[string]string) error {
// 	bucket := s.client.Bucket(s.Bucket)
// 	obj := bucket.Object(path)
// 	objectAttrsToUpdate := storage.ObjectAttrsToUpdate{
// 		Metadata: metadata,
// 	}
// 	if _, err := obj.Update(ctx, objectAttrsToUpdate); err != nil {
// 		return err
// 	}

// 	return nil
// }

// func (s *Storage) Exists(path string) (bool, error) {
// 	bucket := s.client.Bucket(s.Bucket)

// 	if reader, err := bucket.Object(path).NewReader(s.ctx); err != nil {
// 		if err == storage.ErrObjectNotExist {
// 			return false, nil
// 		}
// 		return false, err
// 	} else {
// 		reader.Close()
// 		return true, nil
// 	}
// }

// func (s *Storage) Close() {
// 	s.client.Close()
// }

// // GetStorage returns the singleton storage instance
// func GetStorage() *Storage {
// 	return &storageInstance
// }
