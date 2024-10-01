package imageTools

import (
	"image"
	"image/color"
	"io"

	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/images/config"
)

func CreateBlank() *image.RGBA {

	conf := config.GetConfig()
	width := conf.TileWidth
	height := conf.TileHeight
	baseColor := conf.BaseColor

	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for x := 0; x < width; x++ {
		for y := 0; y < height; y++ {
			img.Set(x, y, color.RGBA(baseColor))
		}
	}

	return img
}

func DecodeImage(r io.Reader) (*image.RGBA, error) {
	img, _, err := image.Decode(r)
	if err != nil {
		return nil, err
	}

	return img.(*image.RGBA), nil
}
