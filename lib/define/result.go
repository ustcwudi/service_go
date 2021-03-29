package define

// error code
const (
	Success int64 = 0
	Error   int64 = -100 * iota
	DatabaseError
	IoError
	APIError
	NetworkError
	AuthError
	FormatError
	LogicError
	RuntimeError
	OutOfLimitError
)

// GetErrorMessage 根据错误代码获取错误信息
func GetErrorMessage(code int64) string {
	switch code {
	case Success:
		return ""
	case Error:
		return "运行失败"
	case DatabaseError:
		return "数据库错误"
	case IoError:
		return "IO错误"
	case APIError:
		return "API错误"
	case NetworkError:
		return "网络错误"
	case AuthError:
		return "权限错误"
	case FormatError:
		return "格式错误"
	case LogicError:
		return "逻辑错误"
	case RuntimeError:
		return "运行时错误"
	case OutOfLimitError:
		return "超出限制"
	default:
		return "未知错误"
	}
}

// Result 返回结果
type Result struct {
	Success bool                   `json:"success"`
	Message string                 `json:"message,omitempty"`
	Code    int64                  `json:"code,omitempty"`
	Data    interface{}            `json:"data,omitempty"`
	Map     map[string]interface{} `json:"map,omitempty"`
	Total   int64                  `json:"total,omitempty"`
}

// SetCode 设置代码和消息
func (r *Result) SetCode(code int64) *Result {
	r.Success = code == Success
	r.Code = code
	if r.Message != "" {
		r.Message = GetErrorMessage(code)
	}
	return r
}

// SetData 设置数据
func (r *Result) SetData(data interface{}) *Result {
	r.Data = data
	r.SetCode(Success)
	return r
}

// SetMessage 设置消息
func (r *Result) SetMessage(message string) *Result {
	r.Message = message
	return r
}

// AddMapData 添加关联数据
func (r *Result) AddMapData(key string, data interface{}) *Result {
	if r.Map == nil {
		r.Map = make(map[string]interface{})
	}
	r.Map[key] = data
	return r
}

// SetTotal 设置数据总量
func (r *Result) SetTotal(total int64) *Result {
	r.Total = total
	return r
}
