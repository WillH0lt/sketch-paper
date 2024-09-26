package redis

import (
	"fmt"

	"github.com/redis/go-redis/v9"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/ws/config"
)

var Client *redis.Client

// Opening the database and create singleton client instance
func Init() *redis.Client {

	c := config.GetConfig()

	Client = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", c.RedisHost, c.RedisPort),
		Password: c.RedisPassword,
		DB:       0,
	})

	return Client
}

// GetRedisClient returns the singleton redis client instance
func GetRedisClient() *redis.Client {
	return Client
}
