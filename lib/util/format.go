package util

import (
	"math"
	"strconv"
	"strings"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ToBool bool类型转换
func ToBool(value interface{}) bool {
	switch value := value.(type) {
	case bool:
		return value
	case string:
		return strings.ToLower(value) == "true"
	case float64:
		return value != 0
	case float32:
		return value != 0
	case int64:
		return value != 0
	case int32:
		return value != 0
	default:
		return false
	}
}

// ToInt int64类型转换
func ToInt(value interface{}) int64 {
	switch value := value.(type) {
	case string:
		r, _ := strconv.ParseInt(value, 0, 64)
		return r
	case int64:
		return value
	case int32:
		return int64(value)
	case float64:
		return int64(value)
	case float32:
		return int64(value)
	default:
		return 0
	}
}

// ToIntArray int64[]类型转换
func ToIntArray(value interface{}) []int64 {
	var array []int64
	switch value := value.(type) {
	case []int64:
		return value
	case []interface{}:
		for _, v := range value {
			array = append(array, ToInt(v))
		}
	case interface{}:
		array = append(array, ToInt(value))
	}
	return array
}

// ToFloat float64类型转换
func ToFloat(value interface{}) float64 {
	switch value := value.(type) {
	case string:
		r, _ := strconv.ParseFloat(value, 64)
		return r
	case float64:
		return value
	case float32:
		return float64(value)
	case int64:
		return float64(value)
	case int32:
		return float64(value)
	default:
		return 0
	}
}

// ToFloatArray float64[]类型转换
func ToFloatArray(value interface{}) []float64 {
	var array []float64
	switch value := value.(type) {
	case []float64:
		return value
	case []interface{}:
		for _, v := range value {
			array = append(array, ToFloat(v))
		}
	case interface{}:
		array = append(array, ToFloat(value))
	}
	return array
}

// ToFloatPair float64[2]类型转换
func ToFloatPair(value interface{}) []float64 {
	switch value := value.(type) {
	case []float64:
		return value
	case []interface{}:
		if len(value) >= 2 {
			min := value[0]
			max := value[1]
			if min == nil {
				min = math.MinInt64
			}
			if max == nil {
				max = math.MaxInt64
			}
			return []float64{ToFloat(min), ToFloat(max)}
		} else if len(value) == 1 {
			result := ToFloat(value[0])
			if result > 0 {
				return []float64{0, result}
			}
			return []float64{result, 0}
		} else {
			return []float64{0, 0}
		}
	case interface{}:
		result := ToFloat(value)
		if result > 0 {
			return []float64{0, result}
		}
		return []float64{result, 0}
	default:
		return []float64{0, 0}
	}
}

// ToID ObjectID类型转换
func ToID(value interface{}) primitive.ObjectID {
	switch value := value.(type) {
	case primitive.ObjectID:
		return value
	case string:
		id, _ := primitive.ObjectIDFromHex(value)
		return id
	default:
		return primitive.NilObjectID
	}
}

// ToIDArray ObjectID[]类型转换
func ToIDArray(value interface{}) []primitive.ObjectID {
	var array []primitive.ObjectID
	switch value := value.(type) {
	case []primitive.ObjectID:
		return value
	case []string:
		for _, x := range value {
			if id := ToID(x); id != primitive.NilObjectID {
				array = append(array, id)
			}
		}
	case []interface{}:
		for _, x := range value {
			if id := ToID(x); id != primitive.NilObjectID {
				array = append(array, id)
			}
		}
	}
	return array
}

// ToString string类型转换
func ToString(value interface{}) string {
	switch value := value.(type) {
	case string:
		return value
	case float64:
		return strconv.FormatFloat(value, 'f', -1, 64)
	case float32:
		return strconv.FormatFloat(float64(value), 'f', -1, 32)
	case int64:
		return strconv.FormatInt(value, 10)
	case int32:
		return strconv.FormatInt(int64(value), 10)
	default:
		return ""
	}
}

// ToStringArray string[]类型转换
func ToStringArray(value interface{}) []string {
	var array []string
	switch value := value.(type) {
	case []string:
		return value
	case []interface{}:
		for _, v := range value {
			array = append(array, ToString(v))
		}
	case interface{}:
		array = append(array, ToString(value))
	}
	return array
}

// ToStringMap map[string]string类型转换
func ToStringMap(value interface{}) map[string]string {
	result := make(map[string]string)
	switch value := value.(type) {
	case map[string]string:
		return value
	case map[string]interface{}:
		for k, v := range value {
			result[k] = ToString(v)
		}
	}
	return result
}

// ToIntMap map[string]int64类型转换
func ToIntMap(value interface{}) map[string]int64 {
	result := make(map[string]int64)
	switch value := value.(type) {
	case map[string]int64:
		return value
	case map[string]interface{}:
		for k, v := range value {
			result[k] = ToInt(v)
		}
	}
	return result
}

// ToFloatMap map[string]float64类型转换
func ToFloatMap(value interface{}) map[string]float64 {
	result := make(map[string]float64)
	switch value := value.(type) {
	case map[string]float64:
		return value
	case map[string]interface{}:
		for k, v := range value {
			result[k] = ToFloat(v)
		}
	}
	return result
}

// ToStringArrayMap map[string][]string类型转换
func ToStringArrayMap(value interface{}) map[string][]string {
	result := make(map[string][]string)
	switch value := value.(type) {
	case map[string][]string:
		return value
	case map[string]interface{}:
		for k, v := range value {
			result[k] = ToStringArray(v)
		}
	}
	return result
}
