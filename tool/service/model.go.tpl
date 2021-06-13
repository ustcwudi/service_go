package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// {{.Name}} {{.Description}}
type {{.Name}} struct {
	ID		primitive.ObjectID	`bson:"_id,omitempty" json:"id,omitempty"`
	{{- range .Fields}}{{if .Nullable}}
	{{.Name}}		*{{gt .Type}}	`bson:"{{c .Name}}" json:"{{c .Name}},omitempty"`	// {{.Description}}
	{{- else}}
	{{.Name}}		{{gt .Type}}	`bson:"{{c .Name}}" json:"{{c .Name}}"`	// {{.Description}}
	{{- end}}{{end}}
	CreateTime		int64	`bson:"createTime" json:"createTime,omitempty"`
	UpdateTime		int64	`bson:"updateTime" json:"updateTime,omitempty"`
	DeleteTime		int64	`bson:"deleteTime" json:"deleteTime,omitempty"`
}