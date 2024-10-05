// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.34.2
// 	protoc        v5.28.2
// source: models.proto

package models

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type DrawSegment struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	TileX         int32   `protobuf:"zigzag32,1,opt,name=tileX,proto3" json:"tileX,omitempty"`
	TileY         int32   `protobuf:"zigzag32,2,opt,name=tileY,proto3" json:"tileY,omitempty"`
	StartX        int32   `protobuf:"zigzag32,3,opt,name=startX,proto3" json:"startX,omitempty"`
	StartY        int32   `protobuf:"zigzag32,4,opt,name=startY,proto3" json:"startY,omitempty"`
	EndX          int32   `protobuf:"zigzag32,5,opt,name=endX,proto3" json:"endX,omitempty"`
	EndY          int32   `protobuf:"zigzag32,6,opt,name=endY,proto3" json:"endY,omitempty"`
	Red           uint32  `protobuf:"varint,7,opt,name=red,proto3" json:"red,omitempty"`
	Green         uint32  `protobuf:"varint,8,opt,name=green,proto3" json:"green,omitempty"`
	Blue          uint32  `protobuf:"varint,9,opt,name=blue,proto3" json:"blue,omitempty"`
	Alpha         uint32  `protobuf:"varint,10,opt,name=alpha,proto3" json:"alpha,omitempty"`
	Size          uint32  `protobuf:"varint,11,opt,name=size,proto3" json:"size,omitempty"`
	Kind          uint32  `protobuf:"varint,12,opt,name=kind,proto3" json:"kind,omitempty"`
	RunningLength float64 `protobuf:"fixed64,13,opt,name=runningLength,proto3" json:"runningLength,omitempty"`
}

func (x *DrawSegment) Reset() {
	*x = DrawSegment{}
	if protoimpl.UnsafeEnabled {
		mi := &file_models_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DrawSegment) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DrawSegment) ProtoMessage() {}

func (x *DrawSegment) ProtoReflect() protoreflect.Message {
	mi := &file_models_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DrawSegment.ProtoReflect.Descriptor instead.
func (*DrawSegment) Descriptor() ([]byte, []int) {
	return file_models_proto_rawDescGZIP(), []int{0}
}

func (x *DrawSegment) GetTileX() int32 {
	if x != nil {
		return x.TileX
	}
	return 0
}

func (x *DrawSegment) GetTileY() int32 {
	if x != nil {
		return x.TileY
	}
	return 0
}

func (x *DrawSegment) GetStartX() int32 {
	if x != nil {
		return x.StartX
	}
	return 0
}

func (x *DrawSegment) GetStartY() int32 {
	if x != nil {
		return x.StartY
	}
	return 0
}

func (x *DrawSegment) GetEndX() int32 {
	if x != nil {
		return x.EndX
	}
	return 0
}

func (x *DrawSegment) GetEndY() int32 {
	if x != nil {
		return x.EndY
	}
	return 0
}

func (x *DrawSegment) GetRed() uint32 {
	if x != nil {
		return x.Red
	}
	return 0
}

func (x *DrawSegment) GetGreen() uint32 {
	if x != nil {
		return x.Green
	}
	return 0
}

func (x *DrawSegment) GetBlue() uint32 {
	if x != nil {
		return x.Blue
	}
	return 0
}

func (x *DrawSegment) GetAlpha() uint32 {
	if x != nil {
		return x.Alpha
	}
	return 0
}

func (x *DrawSegment) GetSize() uint32 {
	if x != nil {
		return x.Size
	}
	return 0
}

func (x *DrawSegment) GetKind() uint32 {
	if x != nil {
		return x.Kind
	}
	return 0
}

func (x *DrawSegment) GetRunningLength() float64 {
	if x != nil {
		return x.RunningLength
	}
	return 0
}

type Stroke struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Segments []*DrawSegment `protobuf:"bytes,1,rep,name=segments,proto3" json:"segments,omitempty"`
}

func (x *Stroke) Reset() {
	*x = Stroke{}
	if protoimpl.UnsafeEnabled {
		mi := &file_models_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Stroke) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Stroke) ProtoMessage() {}

func (x *Stroke) ProtoReflect() protoreflect.Message {
	mi := &file_models_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Stroke.ProtoReflect.Descriptor instead.
func (*Stroke) Descriptor() ([]byte, []int) {
	return file_models_proto_rawDescGZIP(), []int{1}
}

func (x *Stroke) GetSegments() []*DrawSegment {
	if x != nil {
		return x.Segments
	}
	return nil
}

var File_models_proto protoreflect.FileDescriptor

var file_models_proto_rawDesc = []byte{
	0x0a, 0x0c, 0x6d, 0x6f, 0x64, 0x65, 0x6c, 0x73, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x06,
	0x6d, 0x6f, 0x64, 0x65, 0x6c, 0x73, 0x22, 0xb1, 0x02, 0x0a, 0x0b, 0x44, 0x72, 0x61, 0x77, 0x53,
	0x65, 0x67, 0x6d, 0x65, 0x6e, 0x74, 0x12, 0x14, 0x0a, 0x05, 0x74, 0x69, 0x6c, 0x65, 0x58, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x11, 0x52, 0x05, 0x74, 0x69, 0x6c, 0x65, 0x58, 0x12, 0x14, 0x0a, 0x05,
	0x74, 0x69, 0x6c, 0x65, 0x59, 0x18, 0x02, 0x20, 0x01, 0x28, 0x11, 0x52, 0x05, 0x74, 0x69, 0x6c,
	0x65, 0x59, 0x12, 0x16, 0x0a, 0x06, 0x73, 0x74, 0x61, 0x72, 0x74, 0x58, 0x18, 0x03, 0x20, 0x01,
	0x28, 0x11, 0x52, 0x06, 0x73, 0x74, 0x61, 0x72, 0x74, 0x58, 0x12, 0x16, 0x0a, 0x06, 0x73, 0x74,
	0x61, 0x72, 0x74, 0x59, 0x18, 0x04, 0x20, 0x01, 0x28, 0x11, 0x52, 0x06, 0x73, 0x74, 0x61, 0x72,
	0x74, 0x59, 0x12, 0x12, 0x0a, 0x04, 0x65, 0x6e, 0x64, 0x58, 0x18, 0x05, 0x20, 0x01, 0x28, 0x11,
	0x52, 0x04, 0x65, 0x6e, 0x64, 0x58, 0x12, 0x12, 0x0a, 0x04, 0x65, 0x6e, 0x64, 0x59, 0x18, 0x06,
	0x20, 0x01, 0x28, 0x11, 0x52, 0x04, 0x65, 0x6e, 0x64, 0x59, 0x12, 0x10, 0x0a, 0x03, 0x72, 0x65,
	0x64, 0x18, 0x07, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x03, 0x72, 0x65, 0x64, 0x12, 0x14, 0x0a, 0x05,
	0x67, 0x72, 0x65, 0x65, 0x6e, 0x18, 0x08, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x05, 0x67, 0x72, 0x65,
	0x65, 0x6e, 0x12, 0x12, 0x0a, 0x04, 0x62, 0x6c, 0x75, 0x65, 0x18, 0x09, 0x20, 0x01, 0x28, 0x0d,
	0x52, 0x04, 0x62, 0x6c, 0x75, 0x65, 0x12, 0x14, 0x0a, 0x05, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x18,
	0x0a, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x05, 0x61, 0x6c, 0x70, 0x68, 0x61, 0x12, 0x12, 0x0a, 0x04,
	0x73, 0x69, 0x7a, 0x65, 0x18, 0x0b, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x04, 0x73, 0x69, 0x7a, 0x65,
	0x12, 0x12, 0x0a, 0x04, 0x6b, 0x69, 0x6e, 0x64, 0x18, 0x0c, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x04,
	0x6b, 0x69, 0x6e, 0x64, 0x12, 0x24, 0x0a, 0x0d, 0x72, 0x75, 0x6e, 0x6e, 0x69, 0x6e, 0x67, 0x4c,
	0x65, 0x6e, 0x67, 0x74, 0x68, 0x18, 0x0d, 0x20, 0x01, 0x28, 0x01, 0x52, 0x0d, 0x72, 0x75, 0x6e,
	0x6e, 0x69, 0x6e, 0x67, 0x4c, 0x65, 0x6e, 0x67, 0x74, 0x68, 0x22, 0x39, 0x0a, 0x06, 0x53, 0x74,
	0x72, 0x6f, 0x6b, 0x65, 0x12, 0x2f, 0x0a, 0x08, 0x73, 0x65, 0x67, 0x6d, 0x65, 0x6e, 0x74, 0x73,
	0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x13, 0x2e, 0x6d, 0x6f, 0x64, 0x65, 0x6c, 0x73, 0x2e,
	0x44, 0x72, 0x61, 0x77, 0x53, 0x65, 0x67, 0x6d, 0x65, 0x6e, 0x74, 0x52, 0x08, 0x73, 0x65, 0x67,
	0x6d, 0x65, 0x6e, 0x74, 0x73, 0x42, 0x4d, 0x5a, 0x4b, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e,
	0x63, 0x6f, 0x6d, 0x2f, 0x77, 0x69, 0x6c, 0x6c, 0x48, 0x30, 0x6c, 0x74, 0x2f, 0x73, 0x6b, 0x65,
	0x74, 0x63, 0x68, 0x2d, 0x70, 0x61, 0x70, 0x65, 0x72, 0x2f, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c,
	0x65, 0x73, 0x2f, 0x63, 0x72, 0x61, 0x79, 0x6f, 0x6e, 0x2e, 0x74, 0x6f, 0x77, 0x6e, 0x2f, 0x62,
	0x61, 0x63, 0x6b, 0x65, 0x6e, 0x64, 0x2f, 0x73, 0x68, 0x61, 0x72, 0x65, 0x64, 0x2f, 0x6d, 0x6f,
	0x64, 0x65, 0x6c, 0x73, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_models_proto_rawDescOnce sync.Once
	file_models_proto_rawDescData = file_models_proto_rawDesc
)

func file_models_proto_rawDescGZIP() []byte {
	file_models_proto_rawDescOnce.Do(func() {
		file_models_proto_rawDescData = protoimpl.X.CompressGZIP(file_models_proto_rawDescData)
	})
	return file_models_proto_rawDescData
}

var file_models_proto_msgTypes = make([]protoimpl.MessageInfo, 2)
var file_models_proto_goTypes = []any{
	(*DrawSegment)(nil), // 0: models.DrawSegment
	(*Stroke)(nil),      // 1: models.Stroke
}
var file_models_proto_depIdxs = []int32{
	0, // 0: models.Stroke.segments:type_name -> models.DrawSegment
	1, // [1:1] is the sub-list for method output_type
	1, // [1:1] is the sub-list for method input_type
	1, // [1:1] is the sub-list for extension type_name
	1, // [1:1] is the sub-list for extension extendee
	0, // [0:1] is the sub-list for field type_name
}

func init() { file_models_proto_init() }
func file_models_proto_init() {
	if File_models_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_models_proto_msgTypes[0].Exporter = func(v any, i int) any {
			switch v := v.(*DrawSegment); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_models_proto_msgTypes[1].Exporter = func(v any, i int) any {
			switch v := v.(*Stroke); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_models_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   2,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_models_proto_goTypes,
		DependencyIndexes: file_models_proto_depIdxs,
		MessageInfos:      file_models_proto_msgTypes,
	}.Build()
	File_models_proto = out.File
	file_models_proto_rawDesc = nil
	file_models_proto_goTypes = nil
	file_models_proto_depIdxs = nil
}
