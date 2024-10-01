package controllers

import (
	"fmt"
	"image/png"
	"net/http"

	gcp "cloud.google.com/go/storage"
	"github.com/gin-gonic/gin"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/imageTools"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/redis"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/images/storage"
)

type ImageController struct{}

func (h ImageController) Retrieve(c *gin.Context) {
	name := c.Param("name")

	fmt.Printf("Retrieving image %s\n", name)

	img, err := storage.GetImage(c, name)
	if err == gcp.ErrObjectNotExist {
		img = imageTools.CreateBlank()
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch image: %v", err)})
		return
	}

	fmt.Printf("Retrieved image %s\n", name)

	updated, err := imageTools.Augment(c, redis.GetRedisClient(), img, name)
	if err != nil {
		fmt.Printf("Failed to augment image: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to augment image: %v", err)})
		return
	}

	if updated {
		go func() {
			if err := storage.SaveImage(c, name, img); err != nil {
				fmt.Printf("Failed to save image: %v\n", err)
			}
		}()
	}

	if err := png.Encode(c.Writer, img); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to encode image: %v", err)})
		return
	}
}
