package config

import (
	"log"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	Debug     bool   `default:"true"`
	RedisHost string `default:"localhost" split_words:"true"`
	RedisPort int    `default:"6379" split_words:"true"`
	ImagesUrl string `default:"http://localhost:8086" split_words:"true"`
}

func GetConfig() Config {

	var c Config
	if err := envconfig.Process("cleaner", &c); err != nil {
		log.Fatal("Failed to read environment variables")
	}

	return c
}
