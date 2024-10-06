package config

import (
	"log"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	Port       string `default:"8087"`
	Debug      bool   `default:"true"`
	RedisPort  int    `default:"6379" split_words:"true"`
	RedisHost  string `default:"localhost" split_words:"true"`
	TileWidth  int    `default:"2048" split_words:"true"`
	TileHeight int    `default:"2048" split_words:"true"`
	BrushKind  int    `default:"2" split_words:"true"`
	BrushSize  int    `default:"15" split_words:"true"`
}

func GetConfig() Config {

	var c Config
	if err := envconfig.Process("ws", &c); err != nil {
		log.Fatal("Failed to read environment variables")
	}

	return c
}
