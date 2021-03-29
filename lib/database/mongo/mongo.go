package mongo

import (
	"lib/config"
	"lib/log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/net/context"
)

// DB mongo数据库
var DB *mongo.Database

func init() {
	if config.Service.Mongodb.Username != "" && config.Service.Mongodb.Password != "" {
		c, err := mongo.Connect(getContext(), options.Client().ApplyURI(config.Service.Mongodb.Address).SetAuth(options.Credential{
			AuthMechanism: "SCRAM-SHA-1",
			AuthSource:    "admin",
			Username:      config.Service.Mongodb.Username,
			Password:      config.Service.Mongodb.Password}))
		if err != nil {
			panic(err)
		}
		DB = c.Database(config.Service.Mongodb.Database)
	} else {
		c, err := mongo.Connect(getContext(), options.Client().ApplyURI(config.Service.Mongodb.Address))
		if err != nil {
			panic(err)
		}
		DB = c.Database(config.Service.Mongodb.Database)
	}
}

func getContext() (ctx context.Context) {
	ctx, _ = context.WithTimeout(context.Background(), time.Duration(config.Service.Mongodb.Timeout)*time.Second)
	return
}

// InsertOne 单个插入
func InsertOne(table string, document interface{}) (*mongo.InsertOneResult, error) {
	log.Info("mongodb insert one", table, document)
	result, err := DB.Collection(table).InsertOne(getContext(), document)
	if err != nil {
		log.Error("mongodb insert one", err)
	}
	return result, err
}

// InsertMany 多个插入
func InsertMany(table string, documents []interface{}) ([]interface{}, error) {
	log.Info("mongodb insert many", table, documents)
	result, err := DB.Collection(table).InsertMany(getContext(), documents)
	if err != nil {
		log.Error("mongodb insert many", err)
	}
	return result.InsertedIDs, err
}

// FindOneByID 根据ID查询
func FindOneByID(table string, id primitive.ObjectID, projection interface{}) (*mongo.SingleResult, error) {
	return FindOne(table, bson.M{"_id": id}, projection)
}

// FindOne 单个查询
func FindOne(table string, filter interface{}, projection interface{}) (*mongo.SingleResult, error) {
	log.Info("mongodb find one", table, filter)
	result := DB.Collection(table).FindOne(getContext(), filter, options.FindOne().SetProjection(projection))
	err := result.Err()
	if err != nil {
		log.Error("mongodb find one", err)
	}
	return result, err
}

// FindMany 多个查询
func FindMany(table string, filter interface{}, projection interface{}) (*mongo.Cursor, context.Context, error) {
	log.Info("mongodb find many", table, filter)
	if filter == nil {
		filter = bson.D{}
	}
	context := getContext()
	cursor, err := DB.Collection(table).Find(context, filter, options.Find().SetProjection(projection))
	if err != nil {
		log.Error("mongodb find many", err)
	}
	return cursor, context, err
}

// FindManyLimit 多个限制查询
func FindManyLimit(table string, filter interface{}, limit int64, sort interface{}, projection interface{}) (*mongo.Cursor, context.Context, error) {
	log.Info("mongodb find many limit", table, filter, limit, sort)
	if filter == nil {
		filter = bson.D{}
	}
	context := getContext()
	cursor, err := DB.Collection(table).Find(context, filter, options.Find().SetLimit(limit), options.Find().SetSort(sort), options.Find().SetProjection(projection))
	if err != nil {
		log.Error("mongodb find many limit", err)
	}
	return cursor, context, err
}

// FindManySkip 多个分页查询
func FindManySkip(table string, filter interface{}, skip int64, limit int64, sort interface{}, projection interface{}) (*mongo.Cursor, context.Context, error) {
	log.Info("mongodb find many skip", table, filter, skip, limit, sort)
	if filter == nil {
		filter = bson.D{}
	}
	context := getContext()
	cursor, err := DB.Collection(table).Find(context, filter, options.Find().SetSkip(skip), options.Find().SetLimit(limit), options.Find().SetSort(sort), options.Find().SetProjection(projection))
	if err != nil {
		log.Error("mongodb find many skip", err)
	}
	return cursor, context, err
}

// UpdateOneByID 根据ID修改
func UpdateOneByID(table string, id primitive.ObjectID, update interface{}) (int64, error) {
	result, err := UpdateOne(table, bson.M{"_id": id}, update)
	if err != nil {
		log.Error("mongodb update one by id", err)
	}
	return result, err
}

// UpdateOne 单个修改
func UpdateOne(table string, filter interface{}, update interface{}) (int64, error) {
	log.Info("mongodb update one", table, filter, update)
	result, err := DB.Collection(table).UpdateOne(getContext(), filter, bson.M{"$set": update})
	if err != nil {
		log.Error("mongodb update one", err)
	}
	return result.ModifiedCount, err
}

// UpdateMany 多个修改
func UpdateMany(table string, filter interface{}, update interface{}) (int64, error) {
	log.Info("mongodb update many", table, filter, update)
	result, err := DB.Collection(table).UpdateMany(getContext(), filter, bson.M{"$set": update})
	if err != nil {
		log.Error("mongodb update many", err)
	}
	return result.ModifiedCount, err
}

// DeleteOneByID 根据ID删除
func DeleteOneByID(table string, id primitive.ObjectID) (int64, error) {
	return DeleteOne(table, bson.M{"_id": id})
}

// DeleteOne 单个删除
func DeleteOne(table string, filter interface{}) (int64, error) {
	log.Info("mongodb delete one", table, filter)
	result, err := DB.Collection(table).DeleteOne(getContext(), filter)
	if err != nil {
		log.Error("mongodb delete one", err)
	}
	return result.DeletedCount, err
}

// DeleteMany 多个删除
func DeleteMany(table string, filter interface{}) (int64, error) {
	log.Info("mongodb delete many", table, filter)
	result, err := DB.Collection(table).DeleteMany(getContext(), filter)
	if err != nil {
		log.Error("mongodb delete many", err)
	}
	return result.DeletedCount, err
}

// Count 计数
func Count(table string, filter interface{}) (int64, error) {
	log.Info("mongodb count", table, filter)
	if filter == nil {
		filter = bson.D{}
	}
	result, err := DB.Collection(table).CountDocuments(getContext(), filter)
	if err != nil {
		log.Error("mongodb count", err)
	}
	return result, err
}
