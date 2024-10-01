package imageTools

import (
	"context"
	"fmt"
	"image"
	"strings"

	"github.com/redis/go-redis/v9"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/workerpool"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/shared/models"
)

func Augment(ctx context.Context, rdb *redis.Client, img *image.RGBA, name string) (bool, error) {

	label := strings.TrimSuffix(name, ".png")

	drawStrs, err := rdb.LRange(ctx, label, 0, -1).Result()
	if err != nil {
		return false, err
	}

	if len(drawStrs) == 0 {
		return false, nil
	}

	fmt.Printf("Augmenting image %s with %d draw segments\n", name, len(drawStrs))

	drawSegments := make([]*models.DrawSegment, 0)

	for _, drawStr := range drawStrs {
		drawSegment, err := models.NewDrawSegment(drawStr)
		if err != nil {
			continue
		}

		drawSegments = append(drawSegments, drawSegment)
	}

	wp := workerpool.GetWorkerPool()
	wp.SubmitWait(func() {
		if err := makeScreenshot(img, drawSegments); err != nil {
			fmt.Printf("Failed to augment image %s: %v\n", name, err)
		}
		fmt.Printf("Augmented image %s with %d draw segments\n", name, len(drawSegments))
	})

	if _, err := rdb.LTrim(ctx, label, int64(len(drawStrs)), -1).Result(); err != nil {
		return false, err
	}

	return true, nil
}
