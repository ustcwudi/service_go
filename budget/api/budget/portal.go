package budget

import (
	"service/mongo"

	"lib/auth"
	"lib/define"
	"lib/route"

	"net/http"
	"os"
	"path"
	"strconv"
	"time"

	"github.com/360EntSecGroup-Skylar/excelize/v2"
	"github.com/gin-gonic/gin"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RoutePortal portal路由
func RoutePortal(router *gin.Engine) {
	api := router.Group("/api")
	portal := api.Group("/budget")
	{
		portal.POST("/get_children", auth.CheckLogin, GetChildren)
		portal.POST("/aggregate", auth.CheckLogin, route.FetchListForm, Aggregate)
		portal.GET("/excel/:file", auth.CheckLogin, Excel)
		portal.GET("/summary", auth.CheckLogin, route.FetchQuery, AssertWhere, Summary)
		portal.GET("/one_summary", auth.CheckLogin, route.FetchQuery, AssertWhere, OneLevelSummary)
		portal.GET("/two_summary", auth.CheckLogin, route.FetchQuery, AssertWhere, TwoLevelSummary)
		portal.GET("/goal_summary", auth.CheckLogin, route.FetchQuery, AssertWhere, GoalSummary)
	}
}

// ChildrenForm 获取子项目表单
type ChildrenForm struct {
	ID          primitive.ObjectID     `json:"id"`
	WhereBudget map[string]interface{} `json:"whereBudget"`
	Table       string                 `json:"table"`
	WhereTable  map[string]interface{} `json:"whereTable"`
}

// GetChildren 获取子项目
// @summary 获取子项目
// @tags budget portal
// @produce json
// @param data body ChildrenForm true "data"
// @success 200 {object} interface{}
// @router /api/budget/get_children [post]
func GetChildren(c *gin.Context) {
	var form ChildrenForm
	var r define.Result
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, r.SetCode(define.FormatError))
		return
	}
	form.WhereBudget["parent"] = form.ID
	children, _ := mongo.FindManyBudget(form.WhereBudget, bson.M{})
	var ids []primitive.ObjectID
	for _, child := range *children {
		ids = append(ids, child.ID)
	}
	form.WhereTable["budget"] = bson.M{"$in": ids}
	switch form.Table {
	case "BudgetDetail":
		data, _ := mongo.FindManyBudgetDetail(form.WhereTable, bson.M{})
		c.JSON(http.StatusOK, r.SetData(data))
	case "LongtermGoal":
		data, _ := mongo.FindManyLongtermGoal(form.WhereTable, bson.M{})
		c.JSON(http.StatusOK, r.SetData(data))
	case "AnnualGoal":
		data, _ := mongo.FindManyAnnualGoal(form.WhereTable, bson.M{})
		c.JSON(http.StatusOK, r.SetData(data))
	}
}

// Aggregate 汇总
// @summary 汇总
// @tags budget portal
// @produce json
// @param data body map[string]interface{} true "data"
// @success 200 {object} interface{}
// @router /api/budget/aggregate [post]
func Aggregate(c *gin.Context) {
	var r define.Result
	where := c.MustGet("where").(map[string]interface{})
	list, _ := mongo.FindManyBudget(where, nil)
	var ids []primitive.ObjectID
	for _, row := range *list {
		ids = append(ids, row.ID)
	}
	data, _ := mongo.FindManyBudgetDetail(bson.M{"budget": bson.M{"$in": ids}}, bson.M{})
	c.JSON(http.StatusOK, r.SetData(data))
}

// Excel 输出Excel
func Excel(c *gin.Context) {
	_, file := path.Split(c.Request.URL.Path)
	ext := path.Ext(file)
	id := file[:len(file)-len(ext)]
	if ext != ".xlsx" || id == "" {
		http.NotFound(c.Writer, c.Request)
		return
	}
	m, _ := mongo.FindOneBudgetByID(id, bson.M{})
	template, _ := os.Open("static/template.xlsx")
	f, _ := excelize.OpenReader(template)
	page1 := "封面"
	matrix, _ := f.GetRows(page1)
	for x, row := range matrix {
		for y, cell := range row {
			switch cell {
			case "      项目名称：":
				f.SetCellStr(page1, axis(x, y, 0, 0), cell+m.Name)
			case "      项目编码：":
				f.SetCellStr(page1, axis(x, y, 0, 0), cell+m.Code)
			case "      项目单位：":
				f.SetCellStr(page1, axis(x, y, 0, 0), cell)
			case "      省级部门：":
				f.SetCellStr(page1, axis(x, y, 0, 0), cell)
			}
		}
	}
	page2 := "项目申报表"
	matrix, _ = f.GetRows(page2)
	insert := 0
	for x, row := range matrix {
		for y, cell := range row {
			switch cell {
			case "项目名称":
				f.SetCellStr(page2, axis(x, y, 2, 0), m.Name)
			case "项目编码":
				f.SetCellStr(page2, axis(x, y, 2, 0), m.Code)
			case "项目主管部门":
				t, _ := mongo.FindOneDepartmentByID(m.SuperiorDepartment.Hex(), nil)
				f.SetCellStr(page2, axis(x, y, 2, 0), t.Name)
			case "项目执行单位":
				t, _ := mongo.FindOneDepartmentByID(m.Department.Hex(), nil)
				f.SetCellStr(page2, axis(x, y, 2, 0), t.Name)
			case "项目负责人":
				f.SetCellStr(page2, axis(x, y, 2, 0), m.PrincipalName)
			case "联系电话":
				f.SetCellStr(page2, axis(x, y, 2, 0), m.PrincipalPhone)
			case "单位地址":
				f.SetCellStr(page2, axis(x, y, 2, 0), "")
			case "邮政编码":
				f.SetCellStr(page2, axis(x, y, 2, 0), "")
			case "项目属性":
				f.SetCellStr(page2, axis(x, y, 2, 0), m.Attribute)
			case "项目类型":
				f.SetCellStr(page2, axis(x, y, 2, 0), m.FundType)
			case "起始年度":
				f.SetCellInt(page2, axis(x, y, 2, 0), (int)(m.StartYear))
			case "终止年度":
				f.SetCellInt(page2, axis(x, y, 2, 0), (int)(m.EndYear))
			case "项目立项依据":
				f.SetCellStr(page2, axis(x, y, 2, 0), "")
			case "项目实施方案":
				f.SetCellStr(page2, axis(x, y, 2, 0), "")
			case "项目总预算":
				f.SetCellValue(page2, axis(x, y, 2, 0), m.TotalBudget)
			case "项目当年预算":
				f.SetCellValue(page2, axis(x, y, 2, 0), m.YearBudget)
			case "项目前两年预算及当年预算变动情况":
				f.SetCellStr(page2, axis(x, y, 2, 0), "")
			case "合计":
				f.SetCellValue(page2, axis(x, y, 4, 0), m.TotalQuota)
			case "一般公共预算财政拨款":
				f.SetCellValue(page2, axis(x, y, 4, 0), m.SchoolQuota)
			case "  其中：申请当年预算拨款":
				f.SetCellValue(page2, axis(x, y, 4, 0), m.StateCapitalQuota)
			case "政府性基金预算财政拨款":
				f.SetCellValue(page2, axis(x, y, 4, 0), m.GovernmentQuota)
			case "其他资金":
				f.SetCellValue(page2, axis(x, y, 4, 0), m.OtherQuota)
			case "  其中：使用上年度财政拨款结转":
				f.SetCellValue(page2, axis(x, y, 4, 0), 0)
			case "项目支出明细测算":
				details, _ := mongo.FindManyBudgetDetail(bson.M{"budget": m.ID}, nil)
				for _, row := range *details {
					f.DuplicateRow(page2, x+2)
					f.SetCellStr(page2, axis(x, y, 0, 2), row.Action)
					f.SetCellStr(page2, axis(x, y, 1, 2), row.Description)
					f.SetCellStr(page2, axis(x, y, 2, 2), row.ExpenseType)
					f.SetCellValue(page2, axis(x, y, 3, 2), row.Amount)
					f.SetCellStr(page2, axis(x, y, 4, 2), row.Detail)
					f.SetCellStr(page2, axis(x, y, 7, 2), row.Remark)
					f.MergeCell(page2, axis(x, y, 4, 2), axis(x, y, 6, 2))
				}
				insert += len(*details)
			case "项目采购":
				details, _ := mongo.FindManyPurchase(bson.M{"budget": m.ID}, nil)
				for _, row := range *details {
					f.DuplicateRow(page2, x+2+insert)
					f.SetCellStr(page2, axis(x+insert, y, 0, 2), row.Commodity)
					f.SetCellInt(page2, axis(x+insert, y, 2, 2), (int)(row.Quantity))
					f.SetCellValue(page2, axis(x+insert, y, 4, 2), row.Amount)
					f.MergeCell(page2, axis(x+insert, y, 0, 2), axis(x+insert, y, 1, 2))
					f.MergeCell(page2, axis(x+insert, y, 2, 2), axis(x+insert, y, 3, 2))
					f.MergeCell(page2, axis(x+insert, y, 4, 2), axis(x+insert, y, 7, 2))
				}
				insert += len(*details)
			case "长期绩效目标":
				f.SetCellStr(page2, axis(x+insert, y, 2, 0), m.LongtermGoal)
			case "年度绩效目标":
				f.SetCellStr(page2, axis(x+insert, y, 2, 0), m.AnnualGoal)
			case "长期绩效目标表":
				details, _ := mongo.FindManyLongtermGoal(bson.M{"budget": m.ID}, nil)
				for _, row := range *details {
					f.DuplicateRow(page2, x+2+insert)
					f.SetCellStr(page2, axis(x+insert, y, 0, 2), row.Goal)
					f.SetCellStr(page2, axis(x+insert, y, 1, 2), row.FirstLevel)
					f.SetCellStr(page2, axis(x+insert, y, 2, 2), row.SecondLevel)
					f.SetCellStr(page2, axis(x+insert, y, 3, 2), row.Name)
					f.SetCellStr(page2, axis(x+insert, y, 5, 2), row.Value)
					f.SetCellStr(page2, axis(x+insert, y, 6, 2), row.Standard)
					f.MergeCell(page2, axis(x+insert, y, 3, 2), axis(x+insert, y, 4, 2))
				}
				insert += len(*details)
			case "年度绩效目标表":
				details, _ := mongo.FindManyAnnualGoal(bson.M{"budget": m.ID}, nil)
				for _, row := range *details {
					f.DuplicateRow(page2, x+3+insert)
					f.SetCellStr(page2, axis(x+insert, y, 0, 3), row.Goal)
					f.SetCellStr(page2, axis(x+insert, y, 1, 3), row.FirstLevel)
					f.SetCellStr(page2, axis(x+insert, y, 2, 3), row.SecondLevel)
					f.SetCellStr(page2, axis(x+insert, y, 3, 3), row.Name)
					f.SetCellStr(page2, axis(x+insert, y, 4, 3), row.BeforeLastYearValue)
					f.SetCellStr(page2, axis(x+insert, y, 5, 3), row.LastYearValue)
					f.SetCellStr(page2, axis(x+insert, y, 6, 3), row.EstimatedValue)
					f.SetCellStr(page2, axis(x+insert, y, 7, 3), row.Standard)
				}
				insert += len(*details)
			}
		}
	}
	style, _ := f.NewStyle(`{
		"border": [
		{
			"type": "left",
			"color": "000000",
			"style": 1
		},
		{
			"type": "top",
			"color": "000000",
			"style": 1
		},
		{
			"type": "bottom",
			"color": "000000",
			"style": 1
		},
		{
			"type": "right",
			"color": "000000",
			"style": 1
		}],
		"alignment": {
			"horizontal":"center",
			"vertical":"center"
		}}`)
	f.SetCellStyle(page2, "B3", axis(41+insert, 8, 0, 0), style)
	fileName := m.ID.Hex() + ".xlsx"
	f.SaveAs(os.TempDir() + "/" + fileName)
	c.Writer.Header().Set("Content-Type", "application/x-xls")
	reader, _ := os.Open(os.TempDir() + "/" + fileName)
	defer reader.Close()
	http.ServeContent(c.Writer, c.Request, fileName, time.Time{}, reader)
}

func axis(x int, y int, right int, down int) string {
	return string(rune('A'+y+right)) + strconv.Itoa(x+1+down)
}

// Summary 预算汇总
// @summary 预算汇总
// @tags budget portal
// @produce json
// @param data body map[string]interface{} true "data"
// @success 200 {object} interface{}
// @router /api/budget/summary [get]
func Summary(c *gin.Context) {
	var r define.Result
	where := c.MustGet("where").(map[string]interface{})
	budgets, _ := mongo.FindManyBudget(where, nil)
	data := make([]map[string]interface{}, 0)
	for _, budget := range *budgets {
		row := make(map[string]interface{})
		amount := .0
		details, _ := mongo.FindManyBudgetDetail(bson.M{"budget": budget.ID}, bson.M{})
		for _, detail := range *details {
			if detail.AdjustAmount > 0 {
				amount += detail.AdjustAmount
			} else {
				amount += detail.Amount
			}
		}
		row["id"] = budget.ID
		row["name"] = budget.Name
		row["department"] = budget.Department
		row["detail"] = details
		row["amount"] = amount
		if budget.SchoolQuota > 0 {
			row["quota"] = "SchoolQuota"
			row["schoolQuota"] = budget.SchoolQuota
		} else if budget.GovernmentQuota > 0 {
			row["quota"] = "GovernmentQuota"
			row["governmentQuota"] = budget.GovernmentQuota
		} else {
			row["quota"] = "OtherQuota"
			row["otherQuota"] = budget.OtherQuota
		}
		row["year"] = budget.Year
		row["parent"] = budget.Parent
		row["type"] = budget.Type
		row["expenseType"] = budget.ExpenseType
		row["category"] = budget.Category
		row["categoryType"] = budget.Category > 0
		data = append(data, row)
	}
	ids := make([]primitive.ObjectID, len(data))
	for _, row := range data {
		if row["department"] != nil {
			ids = append(ids, row["department"].(primitive.ObjectID))
		}
	}
	department, _ := mongo.FindManyDepartment(bson.M{"_id": bson.M{"$in": ids}}, bson.M{})
	c.JSON(http.StatusOK, r.SetData(data).AddMapData("department", department))
}

// OneLevelSummary 一级汇总
// @summary 一级汇总
// @tags budget portal
// @produce json
// @param data body map[string]interface{} true "data"
// @success 200 {object} interface{}
// @router /api/budget/one_summary [get]
func OneLevelSummary(c *gin.Context) {
	var r define.Result
	where := c.MustGet("where").(map[string]interface{})
	budgets, _ := mongo.FindManyBudget(where, nil)
	data := make([]map[string]interface{}, 0)
	for _, budget := range *budgets {
		details, _ := mongo.FindManyBudgetDetail(bson.M{"budget": budget.ID}, bson.M{})
		for _, detail := range *details {
			amount := .0
			source := "OtherQuota"
			code := detail.ExpenseTypeCode
			category := budget.Category > 0
			if detail.AdjustAmount > 0 {
				amount = detail.AdjustAmount
			} else {
				amount = detail.Amount
			}
			if budget.SchoolQuota > 0 {
				source = "SchoolQuota"
			} else if budget.GovernmentQuota > 0 {
				source = "GovernmentQuota"
			}
			find := false
			for _, row := range data {
				if row["source"] == source && row["code"] == code && row["category"] == category {
					row["amount"] = amount + row["amount"].(float64)
					find = true
					break
				}
			}
			if !find {
				row := make(map[string]interface{})
				row["code"] = code
				row["source"] = source
				row["category"] = category
				row["amount"] = amount
				data = append(data, row)
			}
		}
	}
	ids := make([]primitive.ObjectID, len(data))
	for _, row := range data {
		if code, ok := row["code"].(string); ok {
			if id, err := primitive.ObjectIDFromHex(code); err == nil {
				ids = append(ids, id)
			}
		}
	}
	classification, _ := mongo.FindManyClassification(bson.M{"_id": bson.M{"$in": ids}}, bson.M{})
	dictionary := make(map[string]string)
	for _, item := range *classification {
		dictionary[item.ID.Hex()] = item.Parent.Hex()
	}
	summary := make([]map[string]interface{}, 0)
	ids = make([]primitive.ObjectID, len(data))
	for _, item := range data {
		item["code"] = dictionary[item["code"].(string)]
		if id, err := primitive.ObjectIDFromHex(item["code"].(string)); err == nil {
			ids = append(ids, id)
		}
		find := false
		for _, row := range summary {
			if row["source"].(string) == item["source"].(string) && row["code"].(string) == item["code"].(string) && row["category"].(bool) == item["category"].(bool) {
				row["amount"] = item["amount"].(float64) + row["amount"].(float64)
				find = true
				break
			}
		}
		if !find {
			summary = append(summary, item)
		}
	}
	classification, _ = mongo.FindManyClassification(bson.M{"_id": bson.M{"$in": ids}}, bson.M{})
	c.JSON(http.StatusOK, r.SetData(summary).AddMapData("classification", classification))
}

// TwoLevelSummary 二级汇总
// @summary 二级汇总
// @tags budget portal
// @produce json
// @param data body map[string]interface{} true "data"
// @success 200 {object} interface{}
// @router /api/budget/two_summary [get]
func TwoLevelSummary(c *gin.Context) {
	var r define.Result
	where := c.MustGet("where").(map[string]interface{})
	budgets, _ := mongo.FindManyBudget(where, nil)
	data := make([]map[string]interface{}, 0)
	for _, budget := range *budgets {
		details, _ := mongo.FindManyBudgetDetail(bson.M{"budget": budget.ID}, bson.M{})
		for _, detail := range *details {
			amount := .0
			source := "OtherQuota"
			code := detail.ExpenseTypeCode
			category := budget.Category > 0
			if detail.AdjustAmount > 0 {
				amount = detail.AdjustAmount
			} else {
				amount = detail.Amount
			}
			if budget.SchoolQuota > 0 {
				source = "SchoolQuota"
			} else if budget.GovernmentQuota > 0 {
				source = "GovernmentQuota"
			}
			find := false
			for _, row := range data {
				if row["source"] == source && row["code"] == code && row["category"] == category {
					row["amount"] = amount + row["amount"].(float64)
					find = true
					break
				}
			}
			if !find {
				row := make(map[string]interface{})
				row["code"] = code
				row["source"] = source
				row["category"] = category
				row["amount"] = amount
				data = append(data, row)
			}
		}
	}
	ids := make([]primitive.ObjectID, len(data))
	for _, row := range data {
		if code, ok := row["code"].(string); ok {
			if id, err := primitive.ObjectIDFromHex(code); err == nil {
				ids = append(ids, id)
			}
		}
	}
	classification, _ := mongo.FindManyClassification(bson.M{"_id": bson.M{"$in": ids}}, bson.M{})
	c.JSON(http.StatusOK, r.SetData(data).AddMapData("classification", classification))
}

// GoalSummary 目标汇总
// @summary 目标汇总
// @tags budget portal
// @produce json
// @param data body map[string]interface{} true "data"
// @success 200 {object} interface{}
// @router /api/budget/goal_summary [get]
func GoalSummary(c *gin.Context) {
	var r define.Result
	where := c.MustGet("where").(map[string]interface{})
	budgets, _ := mongo.FindManyBudget(where, nil)
	data := make([]map[string]interface{}, 0)
	for _, budget := range *budgets {
		row := make(map[string]interface{})
		goals, _ := mongo.FindManyLongtermGoal(bson.M{"budget": budget.ID}, bson.M{})
		row["id"] = budget.ID
		row["name"] = budget.Name
		row["year"] = budget.Year
		row["goal"] = goals
		row["parent"] = budget.Parent
		row["type"] = budget.Type
		row["expenseType"] = budget.ExpenseType
		row["category"] = budget.Category
		row["categoryType"] = budget.Category > 0
		data = append(data, row)
	}
	c.JSON(http.StatusOK, r.SetData(data))
}
