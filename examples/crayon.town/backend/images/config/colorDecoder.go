package config

import (
	"fmt"
	"image/color"
)

type ColorDecoder color.RGBA

func (c *ColorDecoder) Decode(value string) error {
	color := color.RGBA{}
	_, err := fmt.Sscanf(value, "#%02x%02x%02x", &color.R, &color.G, &color.B)
	if err != nil {
		return fmt.Errorf("invalid color: %w", err)
	}

	color.A = 0xFF

	*c = ColorDecoder(color)
	return nil
}
