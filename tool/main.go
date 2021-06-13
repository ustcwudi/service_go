package main

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

// Model 类定义
type Model struct {
	Name        string // 名称
	Description string // 描述
	Link        bool   // 有外键字段
	Upload      bool   // 有上传字段
	Nullable    bool   // 有可空字段
	Fields      []Field
}

// Field 字段定义
// 校验规则 Rule:
// 必填 Require: bool
// 文件大小/字符串长度 Size: int
// 最大值 Max: float
// 最小值 Min: float
// 正则 Regex: string
// 小数精度 Accuracy: int
// 文件后缀 Ext: string[]
type Field struct {
	Name        string                 // 名称
	Type        string                 // 类型(15): bool, string, int, float, id, upload, array, map
	Description string                 // 描述
	Nullable    bool                   // 可空
	Link        string                 // 外链
	Search      string                 // 查询: equal, between, like
	Map         map[string]string      // 映射
	Rule        map[string]interface{} // 校验规则
}

// ScriptType ts类型转换
func ScriptType(t string) string {
	switch t {
	case "int", "float":
		return "number"
	case "int[]", "float[]":
		return "number[]"
	case "bool":
		return "boolean"
	case "string", "upload":
		return "string"
	case "string[]", "upload[]":
		return "string[]"
	case "id":
		return "string"
	case "id[]":
		return "string[]"
	case "map[string]string":
		return "{ [key: string]: string }"
	case "map[string]int":
		return "{ [key: string]: number }"
	case "map[string]float":
		return "{ [key: string]: number }"
	case "map[string]string[]":
		return "{ [key: string]: string[] }"
	default:
		panic(t)
	}
}

// GolangType golang类型转换
func GolangType(t string) string {
	switch t {
	case "int":
		return "int64"
	case "float":
		return "float64"
	case "int[]":
		return "[]int64"
	case "float[]":
		return "[]float64"
	case "bool":
		return "bool"
	case "string", "upload":
		return "string"
	case "string[]", "upload[]":
		return "[]string"
	case "id":
		return "primitive.ObjectID"
	case "id[]":
		return "[]primitive.ObjectID"
	case "map[string]string":
		return "map[string]string"
	case "map[string]int":
		return "map[string]int64"
	case "map[string]float":
		return "map[string]float64"
	case "map[string]string[]":
		return "map[string][]string"
	default:
		panic(t)
	}
}

// MethodType 类型方法
func MethodType(t string) string {
	switch t {
	case "int":
		return "Int"
	case "float":
		return "Float"
	case "int[]":
		return "IntArray"
	case "float[]":
		return "FloatArray"
	case "bool":
		return "Bool"
	case "string", "upload":
		return "String"
	case "string[]", "upload[]":
		return "StringArray"
	case "id":
		return "ID"
	case "id[]":
		return "IDArray"
	case "map[string]string":
		return "StringMap"
	case "map[string]int":
		return "IntMap"
	case "map[string]float":
		return "FloatMap"
	case "map[string]string[]":
		return "StringArrayMap"
	default:
		panic(t)
	}
}

// CamelCase c:大驼峰转小驼峰命名
func CamelCase(name string) string {
	temp := []rune(name)
	if temp[0] < 91 {
		temp[0] += 32
	}
	return string(temp)
}

// UnderScoreCase u:大驼峰转下划线命名
func UnderScoreCase(name string) string {
	var slice []rune
	for _, c := range name {
		if c < 91 {
			slice = append(slice, '_')
			slice = append(slice, c)
		} else {
			slice = append(slice, c)
		}
	}
	return strings.ToLower(string(slice[1:]))
}

// HyphenCase h:大驼峰转横线命名
func HyphenCase(name string) string {
	var slice []rune
	for _, c := range name {
		if c < 91 {
			slice = append(slice, '-')
			slice = append(slice, c)
		} else {
			slice = append(slice, c)
		}
	}
	return strings.ToLower(string(slice[1:]))
}

// UpperCase 下划线/横线转大驼峰命名
func UpperCase(name string) string {
	var slice []rune
	up := false
	for index, c := range name {
		if index == 0 || up {
			slice = append(slice, c-32)
			up = false
		} else if c == '_' || c == '-' {
			up = true
		} else {
			slice = append(slice, c)
		}
	}
	return string(slice)
}

// GetModel 根据名称获取Model
func GetModel(name string, models []Model) *Model {
	for _, model := range models {
		if model.Name == name {
			return &model
		}
	}
	return nil
}

// 读取数据定义文件
func read(path string) []byte {
	f, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	content, _ := ioutil.ReadAll(f)
	return content
}

// getModels 获取模型定义
func getModels(path string) []Model {
	var models []Model
	files, _ := ioutil.ReadDir(path)
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".json") {
			var model Model
			content := read(path + file.Name())
			json.Unmarshal(content, &model)
			model.Name = strings.TrimSuffix(file.Name(), ".json")
			for _, j := range model.Fields {
				if j.Type == "upload" || j.Type == "upload[]" {
					model.Upload = true
				}
				if j.Nullable {
					model.Nullable = true
				}
				if j.Link != "" {
					model.Link = true
				}
			}
			models = append(models, model)
		}
	}
	return models
}

// 根据定义生成文件
func generate(module string) {
	// 基本定义
	commonModels := getModels("./define/")
	// 模块定义
	models := getModels("../" + module + "/define/")
	for x, model := range models {
		for y, commonModel := range commonModels {
			// 合并定义
			if commonModel.Name == model.Name {
				models[x].Link = commonModel.Link || model.Link
				models[x].Nullable = commonModel.Nullable || model.Nullable
				models[x].Upload = commonModel.Upload || model.Upload
				// 移除基本定义,合入模块定义
				models[x].Fields = append(commonModel.Fields, model.Fields...)
				commonModels = append(commonModels[:y], commonModels[y+1:]...)
				break
			}
		}
	}
	// 合并完成
	models = append(models, commonModels...)
	funcMap := template.FuncMap{
		"u":     UnderScoreCase, //转下划线
		"c":     CamelCase,      //转小驼峰
		"h":     HyphenCase,     //转横线
		"gt":    GolangType,     //转go类型
		"st":    ScriptType,     //转ts类型
		"mt":    MethodType,     //根据名称获取定义
		"model": func(name string) *Model { return GetModel(name, models) }}
	// output model define
	content := read("service/model.go.tpl")
	tmpl, _ := template.New("service_model").Funcs(funcMap).Parse(string(content))
	os.Mkdir("../"+module+"/model", os.ModePerm)
	for _, define := range models {
		f, _ := os.Create("../" + module + "/model/" + UnderScoreCase(define.Name) + ".go")
		tmpl.Execute(f, define)
	}
	// output mongo dao
	content = read("service/mongo.go.tpl")
	tmpl, _ = template.New("service_mongo").Funcs(funcMap).Parse(string(content))
	os.Mkdir("../"+module+"/mongo", os.ModePerm)
	for _, define := range models {
		f, _ := os.Create("../" + module + "/mongo/" + UnderScoreCase(define.Name) + ".go")
		tmpl.Execute(f, define)
	}
	// output admin api
	content = read("service/api.go.tpl")
	tmpl, _ = template.New("service_api").Funcs(funcMap).Parse(string(content))
	for _, define := range models {
		os.Mkdir("../"+module+"/api/"+UnderScoreCase(define.Name), os.ModePerm)
		f, _ := os.Create("../" + module + "/api/" + UnderScoreCase(define.Name) + "/admin.go")
		tmpl.Execute(f, define)
	}
	// output route
	pathList := make([]string, 0)
	packageList := make([]string, 0)
	filepath.Walk("../"+module+"/api/", func(path string, info os.FileInfo, err error) error {
		if strings.HasSuffix(info.Name(), ".go") {
			path := path[8+len(module) : len(path)-3]
			if index := strings.IndexAny(path, "\\/"); index > 0 {
				pathList = append(pathList, path[:index]+".Route"+UpperCase(path[index+1:])+"(router)")
			} else if path != "route" {
				pathList = append(pathList, "Route"+UpperCase(path)+"(router)")
			}
		} else if info.Name() != "api" {
			packageList = append(packageList, info.Name())
		}
		return nil
	})
	content = read("service/route.go.tpl")
	tmpl, _ = template.New("service_route").Funcs(funcMap).Parse(string(content))
	f, _ := os.Create("../" + module + "/api/route.go")
	tmpl.Execute(f, map[string]interface{}{"PathList": pathList, "PackageList": packageList})
	// output web defination
	os.Mkdir("../web/src/pages/main/base", os.ModePerm)
	content = read("web/index.ts.tpl")
	tmpl, _ = template.New("web_index").Funcs(funcMap).Parse(string(content))
	for _, define := range models {
		os.Mkdir("../web/src/pages/main/base/"+UnderScoreCase(define.Name), os.ModePerm)
		f, _ := os.Create("../web/src/pages/main/base/" + UnderScoreCase(define.Name) + "/index.d.ts")
		tmpl.Execute(f, define)
	}
	// output web column
	content = read("web/columns.ts.tpl")
	tmpl, _ = template.New("web_columns").Funcs(funcMap).Parse(string(content))
	for _, define := range models {
		f, _ := os.Create("../web/src/pages/main/base/" + UnderScoreCase(define.Name) + "/columns.tsx")
		tmpl.Execute(f, define)
	}
	// output web layout
	content = read("web/layout.ts.tpl")
	tmpl, _ = template.New("web_layout").Funcs(funcMap).Parse(string(content))
	for _, define := range models {
		f, _ := os.Create("../web/src/pages/main/base/" + UnderScoreCase(define.Name) + "/_layout.tsx")
		tmpl.Execute(f, define)
	}
	// output web table
	content = read("web/table.ts.tpl")
	tmpl, _ = template.New("web_table").Funcs(funcMap).Parse(string(content))
	for _, define := range models {
		f, _ := os.Create("../web/src/pages/main/base/" + UnderScoreCase(define.Name) + "/table.tsx")
		tmpl.Execute(f, define)
	}
}

func main() {
	for _, argument := range os.Args {
		_, err := os.Stat("../" + argument)
		if err == nil {
			generate(argument)
		}
	}
}
