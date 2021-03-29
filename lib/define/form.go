package define

// ListForm 查询表单
type ListForm struct {
	Where      map[string]interface{} `form:"where" json:"where"`
	Sort       []Sort                 `form:"sort" json:"sort"`
	Pagination Pagination             `form:"pagination" json:"pagination"`
}

// EditForm 修改表单
type EditForm struct {
	Where map[string]interface{} `form:"where" json:"where"`
	Patch map[string]interface{} `form:"patch" json:"patch"`
}

// Pagination 分页
type Pagination struct {
	Current  int64 `form:"current" json:"current"`
	PageSize int64 `form:"pageSize" json:"pageSize"`
}

// Sort 排序
type Sort struct {
	Field string `form:"field" json:"field"`
	Order string `form:"order" json:"order"`
}
