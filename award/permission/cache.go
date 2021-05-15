package permission

import (
	"service/model"
	"service/mongo"
)

var QueryFieldCache map[string][]string    // 查询字段缓存
var UpdateFieldCache map[string][]string   // 更新字段缓存
var InsertFieldCache map[string][]string   // 插入字段缓存
var ActionCache map[string]map[string]bool // 行为缓存
var AspectCache map[string][]string        // 切面缓存
var RoleCache map[string]*model.Role       // 角色缓存

func init() {
	FetchCache()
}

// 权限缓存
func FetchCache() {
	if roles, err := mongo.FindManyRole(nil, nil); err == nil {
		roleCache := make(map[string]*model.Role)
		for _, role := range *roles {
			roleCache[role.ID.Hex()] = &role
		}
		RoleCache = roleCache
	}
	if restrictions, err := mongo.FindManyRestriction(nil, nil); err == nil {
		queryFieldCache := make(map[string][]string)
		updateFieldCache := make(map[string][]string)
		insertFieldCache := make(map[string][]string)
		actionCache := make(map[string]map[string]bool)
		for _, restriction := range *restrictions {
			queryFieldCache[restriction.Role.Hex()+restriction.Table] = restriction.QueryField
			updateFieldCache[restriction.Role.Hex()+restriction.Table] = restriction.UpdateField
			insertFieldCache[restriction.Role.Hex()+restriction.Table] = restriction.InsertField
			set := make(map[string]bool)
			for _, action := range restriction.Action {
				set[action] = false
			}
			actionCache[restriction.Role.Hex()+restriction.Table] = set
		}
		QueryFieldCache = queryFieldCache
		UpdateFieldCache = updateFieldCache
		InsertFieldCache = insertFieldCache
		ActionCache = actionCache
	}
	if aspects, err := mongo.FindManyAspect(nil, nil); err == nil {
		aspectCache := make(map[string][]string)
		for _, aspect := range *aspects {
			for _, role := range aspect.Role {
				for _, action := range aspect.Action {
					if injections, exist := aspectCache[role.Hex()+action]; exist {
						aspectCache[role.Hex()+action] = append(injections, aspect.Injection...)
					} else {
						aspectCache[role.Hex()+action] = aspect.Injection
					}
				}
			}
		}
		AspectCache = aspectCache
	}
}
