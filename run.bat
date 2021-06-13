echo off
xcopy .\web\src\pages\main\%1\ .\web\src\extra\%1\ /s /y
cd tool
go run main.go %1
if "%2"=="go" (
    cd ../%1
    swag init -g service.go
    start go run .\service.go
    cd ..
) else if "%2"=="web" (
    cd ../web
    start tyarn start
    cd ..
)  else if "%2"=="gen" (
    cd ..
)  else if "%2"=="build" (
    cd ../%1
    docker builder prune
    docker build -t ustcwudi/service:%1 .
    docker push ustcwudi/service:%1
    cd ..
)  else if "%2"=="up" (
    cd ../%1
    docker-compose up -d
    cd ..
)  else if "%2"=="down" (
    cd ../%1
    docker-compose down
    cd ..
) else (
    cd ../%1
    swag init -g service.go
    start go run .\service.go
    cd ../web
    start tyarn start
    cd ..
)
