package mongo

import (
	"lib/database/mongo"
	"service/model"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// InsertOne{{.Name}} 新增单个{{.Description}}数据
func InsertOne{{.Name}}(model *model.{{.Name}}) (interface{}, error) {
	model.CreateTime = time.Now().UnixNano()
	result, err := mongo.InsertOne("{{.Name}}", model)
	model.ID = result.InsertedID.(primitive.ObjectID)
	return result.InsertedID, err
}

// InsertMany{{.Name}} 新增多个{{.Description}}数据
func InsertMany{{.Name}}(list *[]model.{{.Name}}) ([]interface{}, error) {
	// 转换为[]interface{}类型
	arr := make([]interface{}, len(*list))
	now := time.Now().UnixNano()
	for i, model := range *list {
		model.CreateTime = now + int64(i)
        arr[i] = model
    }
	return mongo.InsertMany("{{.Name}}", arr)
}

// FindOne{{.Name}}ByID 根据ID查询单个{{.Description}}数据
func FindOne{{.Name}}ByID(hex string, projection interface{}) (*model.{{.Name}}, error) {
	var model model.{{.Name}}
	id, err := primitive.ObjectIDFromHex(hex)
	if err != nil {
		return nil, err
	}
	result, err := mongo.FindOneByID("{{.Name}}", id, projection)
	if err == nil {
		if err = result.Decode(&model); err == nil {
			return &model, err
		}
	}
	return nil, err
}

// FindOne{{.Name}} 查询单个{{.Description}}数据
func FindOne{{.Name}}(filter interface{}, projection interface{}) (*model.{{.Name}}, error) {
	var model model.{{.Name}}
	result, err := mongo.FindOne("{{.Name}}", filter, projection)
	if err == nil {
		if err = result.Decode(&model); err == nil {
			return &model, err
		}
	}
	return nil, err
}

// FindMany{{.Name}} 查询多个{{.Description}}
func FindMany{{.Name}}(filter interface{}, projection interface{}) (*[]model.{{.Name}}, error) {
	var list []model.{{.Name}}
	cursor, context, err := mongo.FindMany("{{.Name}}", filter, projection)
	if err == nil {
		for cursor.Next(context) {
			var item model.{{.Name}}
			if err := cursor.Decode(&item); err != nil {
				return &list, err
			}
			list = append(list, item)
		}
		defer cursor.Close(context)
	}
	return &list, err
}

// FindMany{{.Name}}Data 查询多个{{.Description}}数据
func FindMany{{.Name}}Data(filter interface{}, projection interface{}) (*[]map[string]interface{}, error) {
	var list []map[string]interface{}
	cursor, context, err := mongo.FindMany("{{.Name}}", filter, projection)
	if err == nil {
		err = cursor.All(context, &list)
	}
	// 重命名_id
	for _, item := range list {
		if id, exist := item["_id"]; exist {
			item["id"] = id
			delete(item, "_id")
		}
	}
	return &list, err
}

// FindMany{{.Name}}Limit 限量查询多个{{.Description}}
func FindMany{{.Name}}Limit(filter interface{}, limit int64, sort interface{}, projection interface{}) (*[]model.{{.Name}}, error) {
	var list []model.{{.Name}}
	cursor, context, err := mongo.FindManyLimit("{{.Name}}", filter, limit, sort, projection)
	if err == nil {
		for cursor.Next(context) {
			var item model.{{.Name}}
			if err := cursor.Decode(&item); err != nil {
				return &list, err
			}
			list = append(list, item)
		}
		defer cursor.Close(context)
	}
	return &list, err
}

// FindMany{{.Name}}DataLimit 限量查询多个{{.Description}}数据
func FindMany{{.Name}}DataLimit(filter interface{}, limit int64, sort interface{}, projection interface{}) (*[]map[string]interface{}, error) {
	var list []map[string]interface{}
	cursor, context, err := mongo.FindManyLimit("{{.Name}}", filter, limit, sort, projection)
	if err == nil {
		err = cursor.All(context, &list)
	}
	// 重命名_id
	for _, item := range list {
		if id, exist := item["_id"]; exist {
			item["id"] = id
			delete(item, "_id")
		}
	}
	return &list, err
}

// FindMany{{.Name}}Skip 分页查询多个{{.Description}}
func FindMany{{.Name}}Skip(filter interface{}, skip int64, limit int64, sort interface{}, projection interface{}) (*[]model.{{.Name}}, error) {
	var list []model.{{.Name}}
	cursor, context, err := mongo.FindManySkip("{{.Name}}", filter, skip, limit, sort, projection)
	if err == nil {
		for cursor.Next(context) {
			var item model.{{.Name}}
			if err := cursor.Decode(&item); err != nil {
				return &list, err
			}
			list = append(list, item)
		}
		defer cursor.Close(context)
	}
	return &list, err
}

// FindMany{{.Name}}DataSkip 分页查询多个{{.Description}}数据
func FindMany{{.Name}}DataSkip(filter interface{}, skip int64, limit int64, sort interface{}, projection interface{}) (*[]map[string]interface{}, error) {
	var list []map[string]interface{}
	cursor, context, err := mongo.FindManySkip("{{.Name}}", filter, skip, limit, sort, projection)
	if err == nil {
		err = cursor.All(context, &list)
	}
	// 重命名_id
	for _, item := range list {
		if id, exist := item["_id"]; exist {
			item["id"] = id
			delete(item, "_id")
		}
	}
	return &list, err
}

// UpdateOne{{.Name}} 修改单个{{.Description}}数据
func UpdateOne{{.Name}}(filter interface{}, update bson.M) (int64, error) {
	update["updateTime"] = time.Now().UnixNano()
	return mongo.UpdateOne("{{.Name}}", filter, update)
}

// UpdateOne{{.Name}}Complex 复合修改单个{{.Description}}数据
func UpdateOne{{.Name}}Complex(filter interface{}, operation string, update bson.M) (int64, error) {
	return mongo.UpdateOneComplex("{{.Name}}", filter, bson.M{("$" + operation): update, "$set": bson.M{"updateTime": time.Now().UnixNano()}})
}

// UpdateOne{{.Name}}ByID 根据ID修改单个{{.Description}}数据
func UpdateOne{{.Name}}ByID(model *model.{{.Name}}) (int64, error) {
	model.UpdateTime = time.Now().UnixNano()
	return mongo.UpdateOneByID("{{.Name}}", model.ID, model)
}

// UpdateMany{{.Name}} 修改多个{{.Description}}数据
func UpdateMany{{.Name}}(filter interface{}, update bson.M) (int64, error) {
	update["updateTime"] = time.Now().UnixNano()
	return mongo.UpdateMany("{{.Name}}", filter, update)
}

// UpdateMany{{.Name}} 复合修改多个{{.Description}}数据
func UpdateMany{{.Name}}Complex(filter interface{}, operation string, update bson.M) (int64, error) {
	return mongo.UpdateManyComplex("{{.Name}}", filter, bson.M{("$" + operation): update, "$set": bson.M{"updateTime": time.Now().UnixNano()}})
}

// DeleteOne{{.Name}} 删除单个{{.Description}}数据
func DeleteOne{{.Name}}(filter interface{}) (int64, error) {
	return mongo.DeleteOne("{{.Name}}", filter)
}

// DeleteOne{{.Name}}ByID 根据ID删除单个{{.Description}}数据
func DeleteOne{{.Name}}ByID(id primitive.ObjectID) (int64, error) {
	return mongo.DeleteOneByID("{{.Name}}", id)
}

// DeleteMany{{.Name}} 删除多个{{.Description}}数据
func DeleteMany{{.Name}}(filter interface{}) (int64, error) {
	return mongo.DeleteMany("{{.Name}}", filter)
}

// Count{{.Name}} 统计{{.Description}}数量
func Count{{.Name}}(filter interface{}) (int64, error) {
	return mongo.Count("{{.Name}}", filter)
}

// Get{{.Name}}IDList 查询{{.Description}}ID列表
func Get{{.Name}}IDList(filter interface{}) (*[]primitive.ObjectID, error) {
	var list []primitive.ObjectID
	cursor, context, err := mongo.FindMany("{{.Name}}", filter, bson.M{"_id":1})
	if err == nil {
		for cursor.Next(context) {
			var item model.{{.Name}}
			if err := cursor.Decode(&item); err != nil {
				return &list, err
			}
			list = append(list, item.ID)
		}
		defer cursor.Close(context)
	}
	return &list, err
}