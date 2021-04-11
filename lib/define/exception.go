package define

// error code
const (
	Success int64 = 0
	Error   int64 = -100 * iota
	DatabaseError
	IoError
	AuthError
	NetworkError
	APIError
	FormatError
	LogicError
)

// Exception 异常
type Exception struct {
	Code    uint16
	Message string
}
