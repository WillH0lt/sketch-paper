package socket

import (
	"github.com/zishang520/engine.io/v2/log"
	"github.com/zishang520/engine.io/v2/types"
	"github.com/zishang520/socket.io/v2/socket"
)

var io *socket.Server

func Init() {

	log.DEBUG = true

	c := socket.DefaultServerOptions()
	c.SetPerMessageDeflate(&types.PerMessageDeflate{
		Threshold: 1024,
	})
	c.SetCors(&types.Cors{
		Origin:      "*",
		Credentials: true,
	})

	recoveryOptions := socket.ConnectionStateRecovery{}
	recoveryOptions.SetMaxDisconnectionDuration(10000)
	c.SetConnectionStateRecovery(&recoveryOptions)

	io = socket.NewServer(nil, c)
}

func GetIo() *socket.Server {
	return io
}
