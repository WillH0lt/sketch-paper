package models

import "fmt"

type DrawSegments []*DrawSegment

func (d DrawSegments) MarshalBinary() ([]byte, error) {
	b := make([]byte, 0)
	for _, segment := range d {
		segmentBytes, err := segment.MarshalBinary()
		if err != nil {
			return nil, err
		}
		b = append(b, segmentBytes...)
	}
	return b, nil
}

func (d *DrawSegments) UnmarshalBinary(data []byte) error {

	if len(data)%DrawSegmentSize != 0 {
		return fmt.Errorf("invalid data length: %d", len(data))
	}

	segments := make(DrawSegments, 0)
	for i := 0; i < len(data); i += DrawSegmentSize {
		segment := &DrawSegment{}
		if err := segment.UnmarshalBinary(data[i : i+DrawSegmentSize]); err != nil {
			return err
		}
		segments = append(segments, segment)
	}
	*d = segments
	return nil
}
