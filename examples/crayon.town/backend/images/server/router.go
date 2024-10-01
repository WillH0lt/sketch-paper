package server

import (
	"github.com/gin-gonic/gin"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/images/controllers"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/images/middlewares"
)

func NewRouter() *gin.Engine {
	router := gin.New()
	// router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middlewares.CorsMiddleware())

	health := new(controllers.HealthController)

	router.GET("/health", health.Status)

	v1 := router.Group("v1")
	{
		imageGroup := v1.Group("image")
		{
			image := new(controllers.ImageController)
			imageGroup.GET("/:name", image.Retrieve)
		}
	}

	return router
}
