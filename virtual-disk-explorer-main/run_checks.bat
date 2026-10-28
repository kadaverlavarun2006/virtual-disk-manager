@echo off
cd /d c:\sanath\projects\virtual-disk-explorer
echo ====== Running npm lint ======
call npm run lint
echo.
echo ====== Running npm build ======
call npm run build
echo.
echo ====== Running npm test ======
call npm run test
