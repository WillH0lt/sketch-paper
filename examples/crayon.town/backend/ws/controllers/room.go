package controllers

import (
	"context"
	"fmt"

	mapstructure "github.com/mitchellh/mapstructure"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/shared/models"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/config"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/redis"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/socket"
	socketio "github.com/zishang520/socket.io/v2/socket"
)

const (
	RoomName = "room"

	EventJoin     = "join"
	EventLeave    = "leave"
	EventDraw     = "draw"
	EventTileLoad = "tile-load"
)

type Tile struct {
	Index [2]int32 `json:"index"`
}

type RoomController struct{}

func (r RoomController) Join(clients ...any) {
	io := socket.GetIo()

	client := clients[0].(*socketio.Socket)
	client.Join(RoomName)

	io.To(RoomName).Emit(EventJoin, r.nClients())

	client.On("disconnect", func(...any) {
		io.To(RoomName).Emit(EventLeave, r.nClients())
	})

	client.On(EventDraw, func(datas ...any) {
		if err := handleEventDraw(client, datas[0]); err != nil {
			fmt.Printf("Error handling event draw: %v\n", err)
		}
	})

	client.On(EventTileLoad, func(datas ...any) {
		if err := handleEventTileLoad(client, datas[0]); err != nil {
			fmt.Printf("Error handling event tile load: %v\n", err)
		}
	})
}

func handleEventDraw(client *socketio.Socket, data any) error {
	rdb := redis.GetRedisClient()
	c := config.GetConfig()

	var segments models.DrawSegments
	if err := mapstructure.Decode(data, &segments); err != nil {
		fmt.Println("Error decoding draw segment", err)
		return err
	}

	// group by tileX and tileY
	groupedSegments := make(map[string]models.DrawSegments)
	for _, segment := range segments {
		key := fmt.Sprintf("%d_%d", segment.TileX/int32(c.TileWidth), segment.TileY/int32(c.TileHeight))
		groupedSegments[key] = append(groupedSegments[key], segment)
	}

	for key, segments := range groupedSegments {
		if _, err := rdb.RPush(
			context.Background(),
			key,
			segments,
		).Result(); err != nil {
			return err
		}
	}

	if err := client.Broadcast().To(RoomName).Emit(EventDraw, data); err != nil {
		return err
	}

	return nil
}

func handleEventTileLoad(client *socketio.Socket, data any) error {
	rdb := redis.GetRedisClient()

	var tile Tile
	if err := mapstructure.Decode(data, &tile); err != nil {
		fmt.Println("Error decoding tile", err)
		return err
	}

	listName := fmt.Sprintf("%d_%d", tile.Index[0], tile.Index[1])

	records, err := rdb.LRange(
		context.Background(),
		listName,
		0,
		-1,
	).Result()

	if err != nil {
		return err
	} else if len(records) == 0 {
		return nil
	}

	var allSegments models.DrawSegments
	for _, record := range records {
		var segments models.DrawSegments
		if err := segments.UnmarshalBinary([]byte(record)); err != nil {
			return err
		}
		allSegments = append(allSegments, segments...)
	}

	io := socket.GetIo()
	if err := io.To(socketio.Room(client.Id())).Emit(EventDraw, allSegments); err != nil {
		return err
	}

	return nil
}

func (r RoomController) nClients() int {
	io := socket.GetIo()

	room, ok := io.Sockets().Adapter().Rooms().Load(RoomName)
	var size int
	if !ok {
		size = 0
	} else {
		size = room.Len()
	}

	return size
}
