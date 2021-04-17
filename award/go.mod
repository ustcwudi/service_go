module service

go 1.16

replace (
	github.com/unidoc/unipdf/v3 => github.com/ustcwudi/unipdf/v3 v3.19.1-0.20210224093255-2b39bf0d1c14
	lib => ../lib
)

require (
	github.com/360EntSecGroup-Skylar/excelize/v2 v2.3.2
	github.com/alecthomas/template v0.0.0-20190718012654-fb15b899a751
	github.com/beevik/etree v1.1.0
	github.com/gin-gonic/gin v1.7.1
	github.com/swaggo/gin-swagger v1.3.0
	github.com/swaggo/swag v1.7.0
	github.com/unidoc/unipdf/v3 v3.19.1
	go.mongodb.org/mongo-driver v1.5.1
	lib v0.0.0-00010101000000-000000000000
)
