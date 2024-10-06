package controllers

import (
	"context"
	"encoding/base64"
	"fmt"
	"math"

	mapstructure "github.com/mitchellh/mapstructure"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/shared/models"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/config"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/redis"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/socket"
	socketio "github.com/zishang520/socket.io/v2/socket"
	"google.golang.org/protobuf/proto"
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

	str, ok := data.(string)
	if !ok {
		return fmt.Errorf("data is not a string")
	}

	byteData, err := base64.StdEncoding.DecodeString(str)
	if err != nil {
		return err
	}

	var stroke models.Stroke
	if err := proto.Unmarshal(byteData, &stroke); err != nil {
		return fmt.Errorf("error unmarshalling stroke: %w", err)
	}

	if err := verifyStroke(&stroke); err != nil {
		return err
	}

	// group by tileX and tileY
	groupedStrokes := make(map[string]*models.Stroke)
	for _, segment := range stroke.Segments {
		key := fmt.Sprintf("%d_%d", segment.TileX/int32(c.TileWidth), segment.TileY/int32(c.TileHeight))
		stroke, ok := groupedStrokes[key]
		if !ok {
			stroke = &models.Stroke{}
			groupedStrokes[key] = stroke
		}

		stroke.Segments = append(stroke.Segments, segment)
	}

	for key, stroke := range groupedStrokes {
		b, err := proto.Marshal(stroke)
		if err != nil {
			return err
		}

		if _, err := rdb.RPush(
			context.Background(),
			key,
			b,
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

	stroke := &models.Stroke{}
	for _, record := range records {
		var s models.Stroke
		if err := proto.Unmarshal([]byte(record), &s); err != nil {
			return fmt.Errorf("error unmarshalling stroke: %w", err)
		}
		stroke.Segments = append(stroke.Segments, s.Segments...)
	}

	byteData, err := proto.Marshal(stroke)
	if err != nil {
		return err
	}

	str := base64.StdEncoding.EncodeToString(byteData)

	io := socket.GetIo()
	if err := io.To(socketio.Room(client.Id())).Emit(EventDraw, str); err != nil {
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

func verifyStroke(stroke *models.Stroke) error {
	c := config.GetConfig()

	if len(stroke.Segments) == 0 {
		return fmt.Errorf("stroke has no segments")
	}

	if len(stroke.Segments) > 100 {
		return fmt.Errorf("stroke has too many segments")
	}

	for _, segment := range stroke.Segments {
		lengthSq := powInt(segment.EndX-segment.StartX, 2) + powInt(segment.EndY-segment.StartY, 2)
		if lengthSq > 1e6 {
			return fmt.Errorf("segment is too long")
		}
		if int(segment.Kind) != c.BrushKind {
			return fmt.Errorf("segment has wrong brush kind")
		}
		if int(segment.Size) != c.BrushSize {
			return fmt.Errorf("segment has wrong brush size")
		}
		if segment.Alpha != 255 {
			return fmt.Errorf("alpha must be 255")
		}
	}

	return nil
}

func powInt(x, y int32) int32 {
	return int32(math.Pow(float64(x), float64(y)))
}
