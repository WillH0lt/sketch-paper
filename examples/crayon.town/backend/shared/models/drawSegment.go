package models

import (
	"encoding/binary"
	"fmt"
)

type DrawSegment struct {
	TileX  int32  `json:"tileX"`
	TileY  int32  `json:"tileY"`
	StartX int32  `json:"startX"`
	StartY int32  `json:"startY"`
	EndX   int32  `json:"endX"`
	EndY   int32  `json:"endY"`
	Size   uint16 `json:"size"`
	Red    uint8  `json:"red"`
	Green  uint8  `json:"green"`
	Blue   uint8  `json:"blue"`
	Alpha  uint8  `json:"alpha"`
	Kind   uint8  `json:"kind"`
}

const DrawSegmentSize = 31

func (d DrawSegment) MarshalBinary() ([]byte, error) {
	data := make([]byte, DrawSegmentSize)
	binary.LittleEndian.PutUint32(data[0:4], uint32(d.TileX))
	binary.LittleEndian.PutUint32(data[4:8], uint32(d.TileY))
	binary.LittleEndian.PutUint32(data[8:12], uint32(d.StartX))
	binary.LittleEndian.PutUint32(data[12:16], uint32(d.StartY))
	binary.LittleEndian.PutUint32(data[16:20], uint32(d.EndX))
	binary.LittleEndian.PutUint32(data[20:24], uint32(d.EndY))
	binary.LittleEndian.PutUint16(data[24:26], d.Size)
	data[26] = byte(d.Red)
	data[27] = byte(d.Green)
	data[28] = byte(d.Blue)
	data[29] = byte(d.Alpha)
	data[30] = byte(d.Kind)

	return data, nil
}

func (d *DrawSegment) UnmarshalBinary(data []byte) error {
	if len(data) != DrawSegmentSize {
		return fmt.Errorf("invalid data length: %d", len(data))
	}

	d.TileX = int32(binary.LittleEndian.Uint32(data[0:4]))
	d.TileY = int32(binary.LittleEndian.Uint32(data[4:8]))
	d.StartX = int32(binary.LittleEndian.Uint32(data[8:12]))
	d.StartY = int32(binary.LittleEndian.Uint32(data[12:16]))
	d.EndX = int32(binary.LittleEndian.Uint32(data[16:20]))
	d.EndY = int32(binary.LittleEndian.Uint32(data[20:24]))
	d.Size = binary.LittleEndian.Uint16(data[24:26])
	d.Red = uint8(data[26])
	d.Green = uint8(data[27])
	d.Blue = uint8(data[28])
	d.Alpha = uint8(data[29])
	d.Kind = uint8(data[30])

	return nil
}

// func NewDrawSegment(message string) (DrawSegment, error) {

// 	segment := DrawSegment{}

// 	byteData, err := base64.StdEncoding.DecodeString(message)
// 	if err != nil {
// 		return segment, err
// 	}

// 	b := bytes.NewReader(byteData)
// 	z, err := zlib.NewReader(b)
// 	if err != nil {
// 		return segment, err
// 	}
// 	defer z.Close()
// 	p, err := io.ReadAll(z)
// 	if err != nil {
// 		return segment, err
// 	}

// 	// convert byte array to int32 array
// 	data := make([]int32, len(p)/4)
// 	for i := 0; i < len(p); i += 4 {
// 		data[i/4] = int32(p[i+3])<<24 | int32(p[i+2])<<16 | int32(p[i+1])<<8 | int32(p[i])
// 	}

// 	// data := make([]int32, 6)
// 	// for i := 0; i < 6; i++ {
// 	// 	var v int32
// 	// 	if err := binary.Read(bytes.NewReader(p), binary.LittleEndian, &v); err != nil {
// 	// 		return nil, err
// 	// 	}
// 	// 	data[i] = v
// 	// }

// 	segment.TileX = data[0]
// 	segment.TileY = data[1]
// 	segment.StartX = data[2]
// 	segment.StartY = data[3]
// 	segment.EndX = data[4]
// 	segment.EndY = data[5]
// 	segment.Red = data[6]
// 	segment.Green = data[7]
// 	segment.Blue = data[8]
// 	segment.Alpha = data[9]
// 	segment.Size = data[10]

// 	return segment, nil
// }
