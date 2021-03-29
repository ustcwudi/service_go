package permission

import (
	"lib/util"
	"service/model"
	"service/mongo"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Injections 触发函数列表
var Triggers map[string]gin.HandlerFunc

func init() {
	if Triggers == nil {
		Triggers = make(map[string]gin.HandlerFunc)
		Triggers["OnBudget"] = OnBudget
		Triggers["OnPurchase"] = OnPurchase
	}
}

// AddTrigger 新增触发器
func AddTrigger(c *gin.Context, function gin.HandlerFunc) {
	if trigger, exist := c.Get("trigger"); exist {
		trigger := trigger.([]gin.HandlerFunc)
		trigger = append(trigger, function)
		c.Set("trigger", trigger)
	} else {
		c.Set("trigger", []gin.HandlerFunc{function})
	}
}

// OnBudget 当Budget变更
func OnBudget(c *gin.Context) {
	function := func(c *gin.Context) {
		update := func(id primitive.ObjectID) {
			if count, err := mongo.CountBudget(bson.M{"parent": id, "deleteTime": 0}); err == nil {
				mongo.UpdateOneBudget(bson.M{"_id": id}, bson.M{"childrenCount": count})
			}
		}
		if data, exist := c.Get("data"); exist {
			switch data := data.(type) {
			case map[string]interface{}:
				if parent, exist := data["parent"]; exist {
					update(util.ToID(parent))
				}
			case model.Budget:
				if data.IsChild {
					update(data.Parent)
				}
			case []map[string]interface{}:
				set := make(map[string]bool)
				for _, element := range data {
					if parent, exist := element["parent"]; exist {
						set[util.ToID(parent).Hex()] = true
					}
				}
				for key := range set {
					id, _ := primitive.ObjectIDFromHex(key)
					update(id)
				}
			case []model.Budget:
				set := make(map[string]bool)
				for _, element := range data {
					if element.IsChild {
						set[element.Parent.Hex()] = true
					}
				}
				for key := range set {
					id, _ := primitive.ObjectIDFromHex(key)
					update(id)
				}
			}
		}
	}
	if where, exist := c.Get("where"); exist {
		if result, err := mongo.FindManyBudgetData(where, nil); err == nil {
			c.Set("data", *result)
		}
	}
	AddTrigger(c, function)
}

// OnPurchase 当Purchase变更
func OnPurchase(c *gin.Context) {
	function := func(c *gin.Context) {
		update := func(id primitive.ObjectID) {
			if count, err := mongo.CountPurchase(bson.M{"budget": id, "deleteTime": 0}); err == nil {
				mongo.UpdateOneBudget(bson.M{"_id": id}, bson.M{"purchaseCount": count})
			}
		}
		if data, exist := c.Get("data"); exist {
			switch data := data.(type) {
			case map[string]interface{}:
				if budget, exist := data["budget"]; exist {
					update(util.ToID(budget))
				}
			case model.Purchase:
				update(data.Budget)
			case []map[string]interface{}:
				set := make(map[string]bool)
				for _, element := range data {
					if budget, exist := element["budget"]; exist {
						set[util.ToID(budget).Hex()] = true
					}
				}
				for key := range set {
					id, _ := primitive.ObjectIDFromHex(key)
					update(id)
				}
			case []model.Purchase:
				set := make(map[string]bool)
				for _, element := range data {
					set[element.Budget.Hex()] = true
				}
				for key := range set {
					id, _ := primitive.ObjectIDFromHex(key)
					update(id)
				}
			}
		}
	}
	if where, exist := c.Get("where"); exist {
		if result, err := mongo.FindManyPurchaseData(where, nil); err == nil {
			c.Set("data", *result)
		}
	}
	AddTrigger(c, function)
}
