package controllers

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/ws/redis"
	"github.com/willH0lt/sketchyDraw/examples/chalk.land/backend/ws/socket"
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

	io.To(RoomName).Emit(EventJoin, r.nClients()+1)

	client := clients[0].(*socketio.Socket)
	client.Join(RoomName)

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
	actionBytes, _ := json.Marshal(data)
	_, err := rdb.RPush(
		context.Background(),
		RoomName,
		actionBytes,
	).Result()

	if err != nil {
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
