package controllers

import (
	"context"
	"fmt"

	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/shared/models"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/redis"
	"github.com/willH0lt/sketch-paper/examples/crayon.town/backend/ws/socket"
	socketio "github.com/zishang520/socket.io/v2/socket"
)

const (
	RoomName = "room"

	EventJoin  = "join"
	EventLeave = "leave"
	EventDraw  = "draw"
)

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
		data := datas[0]
		client.Broadcast().To(RoomName).Emit(EventDraw, data)

		go addRecord(data)
	})
}

func addRecord(data any) {
	rdb := redis.GetRedisClient()

	str := data.(string)
	segment, err := models.NewDrawSegment(str)
	if err != nil {
		fmt.Println("Error creating draw segment", err)
		return
	}

	listName := fmt.Sprintf("%d_%d", segment.TileX, segment.TileY)

	if _, err := rdb.RPush(
		context.Background(),
		listName,
		str,
	).Result(); err != nil {
		fmt.Println("Error adding record to redis", err)
	}
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
