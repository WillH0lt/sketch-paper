package chrome

import (
	"context"

	"github.com/chromedp/chromedp"
)

var Ctx context.Context

// Start running chrome instance
func Init() context.Context {

	ctx, _ := chromedp.NewContext(context.Background())

	// ensure the first tab is created
	if err := chromedp.Run(ctx); err != nil {
		panic(err)
	}

	Ctx = ctx

	return ctx
}

func GetChromeContext() context.Context {
	return Ctx
}
