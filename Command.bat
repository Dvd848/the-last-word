@echo off

setlocal

if "%1" == "up" (
    docker-compose up -d
) else if "%1" == "down" (
    docker-compose down
) else if "%1" == "shell" (
    docker-compose exec app sh
) else if "%1" == "run" (
    npm run watch
) else if "%1" == "build" (
    docker-compose up -d --build
) else (
    echo Invalid command. Please use one of the following commands: up, down, shell, run, build
)

endlocal