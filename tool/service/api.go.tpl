package {{u .Name}}

import (
	"service/model"
	"service/mongo"
	"service/permission"

	"lib/auth"
	"lib/define"
	"lib/log"
	"lib/route"
	"lib/util"{{if eq .Name "Upload"}}
	"lib/storage"{{end}}{{if .Upload}}
	"lib/config"
	"lib/storage"
	"path"{{end}}
	"net/http"{{if or .Link .Upload}}
	"strings"{{end}}
	"unicode"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// RouteAdmin admin路由
func RouteAdmin(router *gin.Engine) {
	api := router.Group("/api")
	admin := api.Group("/admin")
	{
		{{u .Name}} := admin.Group("/{{u .Name}}")
		{
			{{u .Name}}.POST("/list", auth.CheckLogin, route.FetchListForm, AssertWhere, permission.Check("{{.Name}}.List"), permission.Restrict("{{.Name}}"), List)
			{{u .Name}}.GET("", auth.CheckLogin, route.FetchQuery, AssertWhere, permission.Check("{{.Name}}.Query"), permission.Restrict("{{.Name}}"), Query)
			{{u .Name}}.GET("/count", auth.CheckLogin, route.FetchQuery, AssertWhere, permission.Check("{{.Name}}.Count"), permission.Restrict("{{.Name}}"), Count)
			{{u .Name}}.POST("", auth.CheckLogin, route.FetchModel, permission.Check("{{.Name}}.Add"), permission.Restrict("{{.Name}}"), DataMapToObject, Add)
			{{u .Name}}.POST("/import", auth.CheckLogin, route.FetchTable, DataTableToMap, permission.Check("{{.Name}}.Import"), permission.Restrict("{{.Name}}"), DataMapToObject, Add)
			{{u .Name}}.PUT("", auth.CheckLogin, route.FetchEditForm, AssertDataMap, AssertWhere, permission.Check("{{.Name}}.Edit"), permission.Restrict("{{.Name}}"), Edit)
			{{u .Name}}.PUT("/trash", auth.CheckLogin, route.FetchWhere, AssertWhere, permission.Check("{{.Name}}.Trash"), permission.Restrict("{{.Name}}"), Trash)
			{{u .Name}}.PUT("/restore", auth.CheckLogin, route.FetchWhere, AssertWhere, permission.Check("{{.Name}}.Restore"), permission.Restrict("{{.Name}}"), Restore)
			{{u .Name}}.DELETE("", auth.CheckLogin, route.FetchWhere, AssertWhere, permission.Check("{{.Name}}.Delete"), permission.Restrict("{{.Name}}"), Delete){{range $index, $elem := .Fields}}{{if .Upload}}
			{{u $.Name}}.POST("/upload/{{u $elem.Name}}", auth.CheckLogin, permission.Check("{{.Name}}.Upload{{$elem.Name}}"), Upload{{$elem.Name}})
			{{u $.Name}}.GET("/download/{{u $elem.Name}}/:file", auth.CheckLogin, permission.Check("{{.Name}}.Download{{$elem.Name}}"), Download{{$elem.Name}}){{end}}{{end}}
		}
	}{{range $index, $elem := .Fields}}{{if .Upload}}
	storage.CreateBucket("{{h $.Name}}-{{h $elem.Name}}"){{end}}{{end}}
}

// Get 查询
// @summary 查询
// @tags {{u .Name}} admin
// @produce json
// @param Link header string false "link"
// @success 200 {object} interface{}
// @router /api/admin/{{u .Name}} [get]
func Query(c *gin.Context) {
	var result define.Result
	// 生成查询条件
	where := c.MustGet("where").(map[string]interface{})
	// 数据库查询
	if pagination, exist := c.Get("pagination"); exist {
		// 分页查询
		p := pagination.(define.Pagination)
		if list, err := mongo.FindMany{{.Name}}Skip(where, (p.Current-1)*p.PageSize, p.PageSize, nil, getProjection(c)); err == nil { {{if .Link}}
			mapData(strings.Split(c.Request.Header.Get("Link"), ","), list, &result){{end}}
			count, _ := mongo.Count{{.Name}}(where)
			c.JSON(http.StatusOK, result.SetData(list).SetTotal(count))
		} else {
			log.Error(err.Error())
			c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
		}
	} else {
		// 总查询
		if list, err := mongo.FindMany{{.Name}}(where, getProjection(c)); err == nil { {{if .Link}}
			mapData(strings.Split(c.Request.Header.Get("Link"), ","), list, &result){{end}}
			c.JSON(http.StatusOK, result.SetData(list))
		} else {
			log.Error(err.Error())
			c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
		}
	}
}

// Count 统计个数
// @summary 统计
// @tags {{u .Name}} admin
// @produce json
// @success 200 {object} interface{}
// @router /api/admin/{{u .Name}}/count [get]
func Count(c *gin.Context) {
	var result define.Result
	// 生成查询条件
	where := c.MustGet("where").(map[string]interface{})
	// 数据库查询
	if count, err := mongo.Count{{.Name}}(where); err == nil {
		c.JSON(http.StatusOK, result.SetData(count))
	} else {
		log.Error(err.Error())
		c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
	}
}

// List 列表
// @summary 列表
// @tags {{u .Name}} admin
// @produce json
// @param Link header string false "link"
// @param data body map[string]interface{} true "data"
// @success 200 {object} interface{}
// @router /api/admin/{{u .Name}}/list [post]
func List(c *gin.Context) {
	var result define.Result
	// 生成查询条件
	where := c.MustGet("where").(map[string]interface{})
	// 数据库查询
	sort := c.MustGet("sort").(bson.M)
	pagination := c.MustGet("pagination").(define.Pagination)
	if list, err := mongo.FindMany{{.Name}}Skip(where, (pagination.Current-1)*pagination.PageSize, pagination.PageSize, sort, getProjection(c)); err == nil { {{if .Link}}
		mapData(strings.Split(c.Request.Header.Get("Link"), ","), list, &result){{end}}
		count, _ := mongo.Count{{.Name}}(where)
		c.JSON(http.StatusOK, result.SetData(list).SetTotal(count))
	} else {
		log.Error(err.Error())
		c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
	}
}

// Add 新增
// @summary 新增
// @tags {{u .Name}} admin
// @produce json
// @param data body model.{{.Name}} true "data"
// @success 200 {object} interface{}
// @router /api/admin/{{u .Name}} [post]
func Add(c *gin.Context) {
	var result define.Result
	data := c.MustGet("data")
	switch data := data.(type) {
	case model.{{.Name}}:
		// 数据库新增
		if r, err := mongo.InsertOne{{.Name}}(&data); err == nil { {{if .Link}}
			mapData(strings.Split(c.Request.Header.Get("Link"), ","), &[]model.{{.Name}}{data}, &result){{end}}
			c.Set("result", r)
			c.JSON(http.StatusOK, result.SetData(data))
		} else {
			log.Error(err.Error())
			c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
		}
	case []model.{{.Name}}:
		// 多项模式
		if r, err := mongo.InsertMany{{.Name}}(&data); err == nil {
			c.Set("result", r)
			c.JSON(http.StatusOK, result.SetData(r))
		} else {
			log.Error(err.Error())
			c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
		}
	default:
	}
}

// Edit 修改
// @summary 修改
// @tags {{u .Name}} admin
// @produce json
// @param data body map[string]interface{} true "data"
// @success 200 {object} interface{}
// @router /api/admin/{{u .Name}} [put]
func Edit(c *gin.Context) {
	var result define.Result
	// 生成查询条件
	where := c.MustGet("where").(map[string]interface{})
	// 生成修改字段
	data := c.MustGet("data").(map[string]interface{})
	// 数据库操作
	if ids, err := mongo.Get{{.Name}}IDList(where); err == nil {
		if _, err := mongo.UpdateMany{{.Name}}(bson.M{"_id": bson.M{"$in": ids}}, data); err == nil {
			updates, _ := mongo.FindMany{{.Name}}(bson.M{"_id": bson.M{"$in": ids}}, nil){{if .Link}}
			mapData(strings.Split(c.Request.Header.Get("Link"), ","), updates, &result){{end}}
			c.JSON(http.StatusOK, result.SetData(updates))
		} else {
			log.Error(err.Error())
			c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
		}
	} else {
		log.Error(err.Error())
		c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
	}
}

// Trash 废弃
// @summary 废弃
// @tags {{u .Name}} admin
// @produce json
// @param data body map[string]interface{} true "data"
// @success 200 {object} interface{}
// @router /api/admin/{{u .Name}}/trash [put]
func Trash(c *gin.Context) {
	var result define.Result
	// 获取查询条件
	where := c.MustGet("where").(map[string]interface{})
	// 数据库操作
	if r, err := mongo.UpdateMany{{.Name}}(where, bson.M{"deleteTime": time.Now().UnixNano()}); err == nil {
		c.JSON(http.StatusOK, result.SetData(r))
	} else {
		c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
	}
}

// Restore 还原
// @summary 还原
// @tags {{u .Name}} admin
// @produce json
// @param data body map[string]interface{} true "data"
// @success 200 {object} interface{}
// @router /api/admin/{{u .Name}}/restore [put]
func Restore(c *gin.Context) {
	var result define.Result
	// 获取查询条件
	where := c.MustGet("where").(map[string]interface{})
	// 数据库操作
	if r, err := mongo.UpdateMany{{.Name}}(where, bson.M{"deleteTime": 0}); err == nil {
		c.JSON(http.StatusOK, result.SetData(r))
	} else {
		c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
	}
}

// Delete 删除
// @summary 删除
// @tags {{u .Name}} admin
// @produce json
// @param data body map[string]interface{} true "data"
// @success 200 {object} interface{}
// @router /api/admin/{{u .Name}} [delete]
func Delete(c *gin.Context) {
	var result define.Result
	// 生成查询条件
	where := c.MustGet("where").(map[string]interface{}){{if eq .Name "Upload"}}
	// 删除文件
	list, _ := mongo.FindMany{{.Name}}(where, nil)
	for _, item := range *list {
		storage.Remove(item.Table+"-"+item.Field, item.ID.Hex()+"."+item.Ext)
	}{{end}}
	// 数据库操作
	if count, err := mongo.DeleteMany{{.Name}}(where); err == nil {
		c.JSON(http.StatusOK, result.SetData(count))
	} else {
		c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
	}
}{{range $index, $elem := .Fields}}{{if .Upload}}

// Upload{{$elem.Name}} 上传{{.Description}}
// @summary 上传{{.Description}}
// @tags {{u $.Name}} admin
// @produce json
// @accept multipart/form-data
// @param id formData string true "ID"
// @param upload formData file true "upload file"
// @success 200 {object} interface{}
// @router /api/admin/{{u $.Name}}/upload/{{u $elem.Name}} [post]
func Upload{{$elem.Name}}(c *gin.Context) {
	var result define.Result
	current, exist := c.Get("current")
	if !exist {
		c.JSON(http.StatusOK, result.SetCode(define.AuthError))
		return
	}
	currentUser := current.(*model.User)
	form, _ := c.MultipartForm()
	id := form.Value["id"][0]
	item, _ := mongo.FindOne{{$.Name}}ByID(id, bson.M{"_id": 1, "{{c $elem.Name}}": 1})
	files := form.File["upload"]{{if eq $elem.Type "string[]"}}
	var list []string
	var attachments []model.Upload
	for _, file := range files {
		if file.Size > {{c $elem.Size}}*1024*1024 {
			c.JSON(http.StatusOK, result.SetCode(define.LogicError))
			return
		}
		var attachment model.Upload
		index := strings.LastIndex(file.Filename, ".")
		attachment.User = currentUser.ID
		attachment.Name = file.Filename[:index]
		attachment.Ext = strings.ToLower(file.Filename[index+1:])
		attachment.Size = file.Size
		attachment.Table = "{{h $.Name}}"
		attachment.Field = "{{h $elem.Name}}"
		attachment.Key = item.ID
		fileName := "api/admin/{{u $.Name}}/download/{{u $elem.Name}}/"+attachment.ID.Hex()+"."+attachment.Ext
		storage.Upload("{{h $.Name}}-{{h $elem.Name}}", attachment.ID.Hex()+"."+attachment.Ext, file)
		list = append(list, fileName)
		attachments = append(attachments, attachment)
	}
	mongo.InsertManyUpload(&attachments)
	mongo.UpdateOne{{$.Name}}(bson.M{"_id": item.ID}, bson.M{"{{c $elem.Name}}": list})
	c.JSON(http.StatusOK, result.SetData(list)){{else if eq $elem.Type "string"}}
	file := files[0]
	if file.Size > config.Service.Upload.Size*1024*1024 {
		c.JSON(http.StatusOK, result.SetCode(define.LogicError))
		return
	}
	index := strings.LastIndex(file.Filename, ".")
	var attachment model.Upload
	attachment.User = currentUser.ID
	attachment.Name = file.Filename[:index]
	attachment.Ext = strings.ToLower(file.Filename[index+1:])
	attachment.Size = file.Size
	attachment.Table = "{{h $.Name}}"
	attachment.Field = "{{h $elem.Name}}"
	attachment.Key = item.ID
	mongo.InsertOneUpload(&attachment)
	fileName := "api/admin/{{u $.Name}}/download/{{u $elem.Name}}/"+attachment.ID.Hex()+"."+attachment.Ext
	storage.Upload("{{h $.Name}}-{{h $elem.Name}}", attachment.ID.Hex()+"."+attachment.Ext, files[0])
	mongo.UpdateOne{{$.Name}}(bson.M{"_id": item.ID}, bson.M{"{{c $elem.Name}}": fileName})
	c.JSON(http.StatusOK, result.SetData(fileName)){{end}}
}

// Download{{$elem.Name}} 下载{{.Description}}
// @summary 下载{{.Description}}
// @tags {{u $.Name}} admin
// @Param file path string true "file"
// @success 200 {file} binary
// @router /api/admin/{{u $.Name}}/download/{{u $elem.Name}}/{file} [get]
func Download{{$elem.Name}}(c *gin.Context) {
	_, file := path.Split(c.Request.URL.Path)
	ext := path.Ext(file)
	id := file[:len(file)-len(ext)]
	if ext == "" || id == "" {
		http.NotFound(c.Writer, c.Request)
		return
	}
	reader, _ := storage.Download("{{h $.Name}}-{{h $elem.Name}}", file)
	defer reader.Close()
	c.Writer.Header().Set("Cache-Control", "max-age=315360000")
	switch ext {
	case ".png":
		c.Writer.Header().Set("Content-Type", "image/png")
	case ".jpg":
		c.Writer.Header().Set("Content-Type", "image/jpg")
	default:
		c.Writer.Header().Set("Content-Type", "application/octet-stream")
	}
	http.ServeContent(c.Writer, c.Request, id+ext, time.Time{}, reader)
}{{end}}{{end}}{{if .Link}}

// mapData 生成外链数据
func mapData(fields []string, list *[]model.{{.Name}}, r *define.Result) {	
	if len(*list) > 0 && len(fields) > 0 {
		for _, l := range fields {
			switch l { {{range .Fields}}{{if .Link}}
			case "{{c .Name}}":
				var array []primitive.ObjectID
				for _, e := range *list { {{if .Nullable}}
					if e.{{.Name}} != nil {
						array = append(array, {{if eq .Type "id"}}*e.{{.Name}}{{else}}(*e.{{.Name}})...{{end}})
					}{{else}}
					array = append(array, {{if eq .Type "id"}}e.{{.Name}}{{else}}e.{{.Name}}...{{end}}){{end}}
				}
				result, _ := mongo.FindMany{{.Link}}(bson.M{"_id": bson.M{"$in": array}}, bson.M{})
				r.AddMapData("{{c .Name}}", result){{end}}{{end}}
			}
		}
	}
}{{end}}

// AssertWhere 确认查询数据
func AssertWhere(c *gin.Context) {
	where := c.MustGet("where").(map[string]interface{})
	var allow []string
	for k, v := range where {
		// 检查可空字段查询
		if v == nil {
			switch k { {{range .Fields}}{{if .Nullable}}
			case "{{c .Name}}":
				where[k] = nil{{end}}{{end}}
			default:
				delete(where, k)
			}
		} else {
			// 检查非空字段查询
			switch k {
			case "id":
				switch v.(type) {
				case []interface{}:
					where["_id"] = bson.M{"$in": util.ToIDArray(v)}
				default:
					where["_id"] = util.ToID(v)
				}
				delete(where, k)
			case "_id":
				where[k] = v
			case "deleteTime":
				where[k] = v
			case "createTime":
				pair := util.ToFloatPair(v)
				where[k] = bson.M{"$gte": pair[0] * 1e6, "$lte": pair[1] * 1e6}{{range .Fields}}{{if or (eq .Type "id") (eq .Type "id[]")}}
			case "{{c .Name}}":
				switch v.(type) {
				case []interface{}:
					where[k] = bson.M{"$in": util.ToIDArray(v)}
				default:
					where[k] = util.ToID(v)
				}{{else if or (eq .Type "string") (eq .Type "string[]")}}
			case "{{c .Name}}":{{if eq .Search "like"}}
				where[k] = primitive.Regex{Pattern: util.ToString(v), Options: "i"}{{else}}
				switch v.(type) {
				case []interface{}:
					where[k] = bson.M{"$in": util.ToStringArray(v)}
				default:
					where[k] = util.ToString(v)
				}{{end}}{{else if or (eq .Type "int") (eq .Type "int[]")}}
			case "{{c .Name}}":{{if eq .Search "between"}}
				pair := util.ToFloatPair(v)
				where[k] = bson.M{"$gte": pair[0], "$lte": pair[1]}{{else}}
				switch v.(type) {
				case []interface{}:
					where[k] = bson.M{"$in": util.ToIntArray(v)}
				default:
					where[k] = util.ToInt(v)
				}{{end}}{{else if or (eq .Type "float") (eq .Type "float[]")}}
			case "{{c .Name}}":{{if eq .Search "between"}}
				pair := util.ToFloatPair(v)
				where[k] = bson.M{"$gte": pair[0], "$lte": pair[1]}{{else}}
				switch v.(type) {
				case []interface{}:
					where[k] = bson.M{"$in": util.ToFloatArray(v)}
				default:
					where[k] = util.ToFloat(v)
				}{{end}}{{else if or (eq .Type "map[string]string") (eq .Type "map[string]int") (eq .Type "map[string]float") (eq .Type "map[string]string[]")}}
			case "{{c .Name}}":
				switch v := v.(type) {
				case map[string]interface{}:
					for key, value := range v {
						where["{{c .Name}}."+key] = value
						allow = append(allow, "{{c .Name}}."+key)
					}
					delete(where, k)
				}{{else if eq .Type "bool"}}
			case "{{c .Name}}":
				where[k] = util.ToBool(v){{else}}
			case "{{c .Name}}":
				delete(where, k){{end}}{{end}}
			default:
				exist := false
				for _, value := range allow {
					if k == value {
						exist = true
						break
					}
				}
				if !exist {
					delete(where, k)
				}
			}
		}
	}
	c.Set("where", where)
}



// AssertDataMap 确认更新数据
func AssertDataMap(c *gin.Context) {
	data := c.MustGet("data").(map[string]interface{})
	for k, v := range data {
		switch k { {{range .Fields}}{{if eq .Name "Password"}}
		case "password":
			data[k] = util.HashString(v.(string) + config.Service.Security.Salt){{else}}
		// {{.Description}}
		case "{{c .Name}}":
			{{if .Nullable}}if v != nil {
				value := util.To{{mt .Type}}(v)
				data[k] = &value
			}{{else}}data[k] = util.To{{mt .Type}}(v){{end}}{{end}}{{end}}
		default:
			delete(data, k)
		}
	}
	c.Set("data", data)
}

// DataTableToMap table转为map
func DataTableToMap(c *gin.Context) {
	table := c.MustGet("data").([][]string)
	var headers []string
	var dataMap []map[string]interface{}
	for x, spans := range table {
		if x == 0 {
			// 翻译表头
			dictionary := map[string]string{
				"id": "id",{{range .Fields}}
				"{{.Description}}": "{{c .Name}}",{{end}}
			}
			runes := []rune(spans[len(spans)-1])
			if unicode.IsLower(runes[0]) {
				headers = spans
			} else {
				for _, span := range spans {
					headers = append(headers, dictionary[span])
				}
			}
		} else if len(spans) == len(headers) {
			row := make(map[string]interface{})
			for y, span := range spans {
				key := headers[y]
				switch key { {{range .Fields}}{{if or (eq .Type "int[]") (eq .Type "float[]") (eq .Type "string[]") (eq .Type "id[]")}}
				case "{{c .Name}}":
					row[key] = util.Split(span, ";"){{end}}{{end}}
				default:
					row[key] = span
				}
			}
			dataMap = append(dataMap, row)
		}
	}
	c.Set("data", dataMap)
}

// DataMapToObject map转为object
func DataMapToObject(c *gin.Context) {
	convert := func(data map[string]interface{}) model.{{.Name}} {
		var model model.{{.Name}}
		for k, v := range data {
			if v != nil {
				switch k {
				case "id":
					model.ID = util.ToID(v){{range .Fields}}
				// {{.Description}}
				case "{{c .Name}}":
					value := util.To{{mt .Type}}(v){{if eq .Name "Password"}}
					value = util.HashString(value + config.Service.Security.Salt){{end}}
					model.{{.Name}} = {{if .Nullable}}&{{end}}value{{end}}
				}
			}
		}
		return model
    }
	data := c.MustGet("data")
	switch data := data.(type) {
	case map[string]interface{}:
		c.Set("data", convert(data))
	case []map[string]interface{}:
		var models []model.{{.Name}}
		for _, element := range data {
			models = append(models, convert(element))
		}
		c.Set("data", models)
	default:
	}
}

// getProjection 设置禁用字段
func getProjection(c *gin.Context) bson.M {
	projection := make(bson.M)
	if field, exist := c.Get("field"); exist {
		if array := field.([]string); len(array) > 0 {
			for _, value := range array {
				projection[value] = 0
			}
		}
	}
	return projection
}