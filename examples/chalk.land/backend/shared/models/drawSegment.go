package models

import (
	"bytes"
	"compress/zlib"
	"encoding/base64"
	"io"
)

type DrawSegment struct {
	TileX  int32 `json:"tileX"`
	TileY  int32 `json:"tileY"`
	StartX int32 `json:"startX"`
	StartY int32 `json:"startY"`
	EndX   int32 `json:"endX"`
	EndY   int32 `json:"endY"`
	Red    int32 `json:"red"`
	Green  int32 `json:"green"`
	Blue   int32 `json:"blue"`
	Alpha  int32 `json:"alpha"`
	Size   int32 `json:"size"`
}

func NewDrawSegment(message string) (*DrawSegment, error) {
	byteData, err := base64.StdEncoding.DecodeString(message)
	if err != nil {
		return nil, err
	}

	b := bytes.NewReader(byteData)
	z, err := zlib.NewReader(b)
	if err != nil {
		return nil, err
	}
	defer z.Close()
	p, err := io.ReadAll(z)
	if err != nil {
		return nil, err
	}

	// convert byte array to int32 array
	data := make([]int32, len(p)/4)
	for i := 0; i < len(p); i += 4 {
		data[i/4] = int32(p[i+3])<<24 | int32(p[i+2])<<16 | int32(p[i+1])<<8 | int32(p[i])
	}

	// data := make([]int32, 6)
	// for i := 0; i < 6; i++ {
	// 	var v int32
	// 	if err := binary.Read(bytes.NewReader(p), binary.LittleEndian, &v); err != nil {
	// 		return nil, err
	// 	}
	// 	data[i] = v
	// }

	return &DrawSegment{
		TileX:  data[0],
		TileY:  data[1],
		StartX: data[2],
		StartY: data[3],
		EndX:   data[4],
		EndY:   data[5],
		Red:    data[6],
		Green:  data[7],
		Blue:   data[8],
		Alpha:  data[9],
		Size:   data[10],
	}, nil
}
