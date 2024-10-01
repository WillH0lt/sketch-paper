package imageTools

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/chromedp/cdproto/runtime"
	"github.com/chromedp/chromedp"
	"github.com/disintegration/imaging"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/chrome"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/shared/models"
)

func makeScreenshot(img *image.RGBA, segments []*models.DrawSegment) error {

	ctx := chrome.GetChromeContext()
	ctx1, cancel := chromedp.NewContext(ctx)
	defer cancel()

	viewportPadding := 0

	w := img.Bounds().Dx()
	h := img.Bounds().Dy()

	b64Img, err := imageToBase64(img)
	if err != nil {
		return fmt.Errorf("error encoding image to base64: %w", err)
	}

	var res interface{}
	var buf []byte
	cwd, _ := os.Getwd()

	segmentsStr := "["
	for _, segment := range segments {
		segmentStr, err := json.Marshal(segment)
		if err != nil {
			return fmt.Errorf("error marshalling segment: %w", err)
		}
		segmentsStr += string(segmentStr) + ","
	}
	segmentsStr = segmentsStr[:len(segmentsStr)-1] + "]"

	positionX := int(segments[0].TileX) * w
	positionY := int(segments[0].TileY) * h

	t1 := time.Now()
	if err := chromedp.Run(ctx1, chromedp.Tasks{
		chromedp.EmulateViewport(int64(w+2*viewportPadding), int64(h+2*viewportPadding)),
		chromedp.ActionFunc(func(ctx context.Context) error {
			fmt.Printf("time step 1: %v\n", time.Since(t1))
			return nil
		}),
		chromedp.Navigate("file://" + filepath.Join(cwd, "screenshotView", "dist", "index.html")),
		chromedp.ActionFunc(func(ctx context.Context) error {
			fmt.Printf("time step 2: %v\n", time.Since(t1))
			return nil
		}),
		chromedp.Evaluate(`
		(async () => {
			const canvas = window.SketchyDrawCanvas;
			await canvas.init(document.getElementById("app"), `+strconv.Itoa(positionX)+`, `+strconv.Itoa(positionY)+`);
			await canvas.loadImage("`+b64Img+`");
			canvas.draw(`+segmentsStr+`);
		})();`, &res, func(p *runtime.EvaluateParams) *runtime.EvaluateParams {
			return p.WithAwaitPromise(true)
		}),
		chromedp.ActionFunc(func(ctx context.Context) error {
			fmt.Printf("time step 3: %v\n", time.Since(t1))
			return nil
		}),
		chromedp.CaptureScreenshot(&buf),
		chromedp.ActionFunc(func(ctx context.Context) error {
			fmt.Printf("time step 4: %v\n", time.Since(t1))
			return nil
		}),
	}); err != nil {
		return fmt.Errorf("error running chromedp: %w", err)
	}
	fmt.Println("Time taken to make screenshot: ", time.Since(t1))

	screenshot, _, err := image.Decode(bytes.NewReader(buf))
	if err != nil {
		return err
	}
	croppedScreenshot := imaging.Crop(screenshot, image.Rect(viewportPadding, viewportPadding, screenshot.Bounds().Dx()-viewportPadding, screenshot.Bounds().Dy()-viewportPadding))

	for x := 0; x < w; x++ {
		for y := 0; y < h; y++ {
			img.Set(x, y, croppedScreenshot.At(x, y))
		}
	}

	return nil
}

func imageToBase64(img image.Image) (string, error) {
	// Create a buffer to store the PNG-encoded image
	var buf bytes.Buffer

	// Encode the image to PNG and write to the buffer
	if err := png.Encode(&buf, img); err != nil {
		return "", err
	}

	// Convert the buffer to a base64-encoded string
	base64Str := "data:image/png;base64," + base64.StdEncoding.EncodeToString(buf.Bytes())

	return base64Str, nil
}
