package route

import (
	"bufio"
	"encoding/json"
	"io/ioutil"
	"lib/define"
	"lib/util"
	"net/url"
	"strconv"
	"strings"

	"github.com/360EntSecGroup-Skylar/excelize/v2"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// FetchQuery 获取URL参数
func FetchQuery(c *gin.Context) {
	page := int64(0)
	pageSize := int64(10)
	where := make(map[string]interface{})
	// 提取查询条件
	if c.Request.URL.RawQuery != "" {
		query := strings.Split(c.Request.URL.RawQuery, "&")
		for _, line := range query {
			index := strings.IndexRune(line, '=')
			if index >= 0 {
				key := line[:index]
				if value, err := url.QueryUnescape(line[index+1:]); err == nil {
					switch key {
					case "page":
						if number, err := strconv.Atoi(value); err == nil && number > 0 {
							page = int64(number)
						}
					case "pageSize":
						if number, err := strconv.Atoi(value); err == nil && number > 0 && number < 100 {
							pageSize = int64(number)
						}
					default:
						where[key] = value
					}
				}
			}
		}
	}
	// 检查是否回收站模式
	if trash, exist := where["trash"]; exist {
		if util.ToBool(trash) {
			where["deleteTime"] = bson.M{"$gt": 0}
		} else {
			where["deleteTime"] = 0
		}
		delete(where, "trash")
	} else {
		where["deleteTime"] = 0
	}
	// 设置查询参数
	c.Set("where", where)
	// 设置分页参数
	if page > 0 {
		c.Set("pagination", define.Pagination{Current: page, PageSize: pageSize})
	}
}

// FetchListForm 获取列表表单
func FetchListForm(c *gin.Context) {
	var form define.ListForm
	if err := c.ShouldBind(&form); err != nil {
		panic(err)
	}
	// 默认时间倒序
	sort := bson.M{"createTime": -1}
	for _, s := range form.Sort {
		switch s.Order {
		case "ascend":
			sort[s.Field] = 1
		case "descend":
			sort[s.Field] = -1
		}
	}
	c.Set("sort", sort)
	// 分页
	if form.Pagination.Current < 1 {
		form.Pagination.Current = 1
	}
	if form.Pagination.PageSize == 0 || form.Pagination.PageSize > 100 {
		form.Pagination.PageSize = 10
	}
	c.Set("pagination", form.Pagination)
	// 检查是否回收站模式
	if trash, exist := form.Where["trash"]; exist {
		if util.ToBool(trash) {
			form.Where["deleteTime"] = bson.M{"$gt": 0}
		} else {
			form.Where["deleteTime"] = 0
		}
		delete(form.Where, "trash")
	} else {
		form.Where["deleteTime"] = 0
	}
	c.Set("where", form.Where)
}

// FetchEditForm 获取修改表单
func FetchEditForm(c *gin.Context) {
	var form define.EditForm
	// 读取数据流
	if err := c.ShouldBind(&form); err != nil {
		panic(err)
	}
	c.Set("data", form.Patch)
	c.Set("where", form.Where)
}

// FetchModel 获取实例
func FetchModel(c *gin.Context) {
	var model map[string]interface{}
	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		panic(err)
	}
	if err = json.Unmarshal(body, &model); err != nil {
		var models []map[string]interface{}
		if err = json.Unmarshal(body, &models); err != nil {
			panic(err)
		} else {
			c.Set("data", models)
		}
	} else {
		c.Set("data", model)
	}
}

// FetchWhere 获取查询条件
func FetchWhere(c *gin.Context) {
	where := make(map[string]interface{})
	// 读取数据流
	if err := c.ShouldBind(&where); err != nil {
		panic(err)
	}
	// 检查是否回收站模式
	if trash, exist := where["trash"]; exist {
		if util.ToBool(trash) {
			where["deleteTime"] = bson.M{"$gt": 0}
		} else {
			where["deleteTime"] = 0
		}
		delete(where, "trash")
	}
	c.Set("where", where)
}

// FetchTable 获取表格文件
func FetchTable(c *gin.Context) {
	// 数据表格
	var table [][]string
	// 获取文件
	fileHeader, _ := c.FormFile("upload")
	if strings.HasSuffix(fileHeader.Filename, "csv") {
		file, _ := fileHeader.Open()
		defer file.Close()
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			if line := scanner.Text(); line != "" {
				table = append(table, util.Split(line, ","))
			}
		}
	} else if strings.HasSuffix(fileHeader.Filename, "xlsx") {
		file, _ := fileHeader.Open()
		defer file.Close()
		f, _ := excelize.OpenReader(file)
		table, _ = f.GetRows(f.GetSheetName((0)))
	} else {
		panic("unsupported file")
	}
	c.Set("data", table)
}
