package workerpool

import (
	"github.com/gammazero/workerpool"
)

var WP *workerpool.WorkerPool

func Init() *workerpool.WorkerPool {

	WP = workerpool.New(1)

	return WP
}

func GetWorkerPool() *workerpool.WorkerPool {
	return WP
}
