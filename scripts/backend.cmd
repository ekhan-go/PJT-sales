@echo off
pushd "%~dp0..\backend"
call mvnw.cmd spring-boot:run %*
set "result=%errorlevel%"
popd
exit /b %result%
