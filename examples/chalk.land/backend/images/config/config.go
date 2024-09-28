package config

import (
	"log"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	Port           string       `default:"8086"`
	Debug          bool         `default:"true"`
	BaseColor      ColorDecoder `default:"#303030" split_words:"true"`
	TileWidth      int          `default:"2048" split_words:"true"`
	TileHeight     int          `default:"2048" split_words:"true"`
	RedisPort      int          `default:"6379" split_words:"true"`
	RedisHost      string       `default:"localhost" split_words:"true"`
	RedisPassword  string       `default:"" split_words:"true"`
	BucketName     string       `default:"sketch-paper-public" split_words:"true"`
	ServiceAccount string       `default:"./service-account.json" split_words:"true"`
}

func GetConfig() Config {

	var c Config
	if err := envconfig.Process("ws", &c); err != nil {
		log.Fatal("Failed to read environment variables")
	}

	return c
}
