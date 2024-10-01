package socket

import (
	"time"

	"github.com/zishang520/engine.io/v2/log"
	"github.com/zishang520/engine.io/v2/types"
	"github.com/zishang520/socket.io/v2/socket"
)

var io *socket.Server

func Init() {

	log.DEBUG = true

	c := socket.DefaultServerOptions()
	c.SetServeClient(true)
	c.SetPingInterval(300 * time.Millisecond)
	c.SetPingTimeout(200 * time.Millisecond)
	c.SetMaxHttpBufferSize(1000000)
	c.SetConnectTimeout(1000 * time.Millisecond)
	c.SetPerMessageDeflate(&types.PerMessageDeflate{
		Threshold: 0,
	})
	c.SetCors(&types.Cors{
		Origin:      "*",
		Credentials: true,
	})

	recoveryOptions := socket.ConnectionStateRecovery{}
	recoveryOptions.SetMaxDisconnectionDuration(10000)
	c.SetConnectionStateRecovery(&recoveryOptions)

	io = socket.NewServer(nil, nil)
}

func GetIo() *socket.Server {
	return io
}
