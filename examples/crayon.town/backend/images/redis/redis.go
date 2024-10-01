package redis

import (
	"fmt"

	"github.com/redis/go-redis/v9"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/images/config"
)

var Client *redis.Client

// Opening the database and create singleton client instance
func Init() *redis.Client {

	c := config.GetConfig()

	Client = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%d", c.RedisHost, c.RedisPort),
		DB:   0,
	})

	return Client
}

// GetRedisClient returns the singleton redis client instance
func GetRedisClient() *redis.Client {
	return Client
}
