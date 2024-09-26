package server

import (
	"github.com/gin-gonic/gin"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/ws/controllers"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/ws/middlewares"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/ws/socket"
)

func NewRouter() *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middlewares.LoggerMiddleware())

	health := new(controllers.HealthController)
	roomController := new(controllers.RoomController)

	router.GET("/health", health.Status)

	io := socket.GetIo()
	router.GET("/socket.io/*any", gin.WrapH(io.ServeHandler(nil)))
	router.POST("/socket.io/*any", gin.WrapH(io.ServeHandler(nil)))

	io.On("connection", roomController.Join)

	return router
}
