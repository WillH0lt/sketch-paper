package config

import (
	"log"

	"github.com/kelseyhightower/envconfig"
)

var config Config

type Config struct {
	Port          string `default:"8086"`
	Debug         bool   `default:"true"`
	RedisPort     int    `default:"6379" split_words:"true"`
	RedisHost     string `default:"localhost" split_words:"true"`
	RedisPassword string `default:"" split_words:"true"`
}

func GetConfig() Config {

	var c Config
	if err := envconfig.Process("ws", &c); err != nil {
		log.Fatal("Failed to read environment variables")
	}

	return c
}
