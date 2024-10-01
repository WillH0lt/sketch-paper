package models

import (
	"testing"
)

func TestDrawSegment(t *testing.T) {
	segment, err := NewDrawSegment("eJz7////fwYgWPb7/39fZgaGRUA6BUgDAKnwC+4=")
	if err != nil {
		t.Errorf("Error: %v", err)
	}

	if segment.TileX != -1 {
		t.Errorf("TileX: %v", segment.TileX)
	}
	if segment.TileY != 0 {
		t.Errorf("TileY: %v", segment.TileY)
	}
	if segment.StartX != -1114 {
		t.Errorf("StartX: %v", segment.StartX)
	}
	if segment.StartY != 845 {
		t.Errorf("StartY: %v", segment.StartY)
	}
	if segment.EndX != -1118 {
		t.Errorf("EndX: %v", segment.EndX)
	}
	if segment.EndY != 868 {
		t.Errorf("EndY: %v", segment.EndY)
	}
}
