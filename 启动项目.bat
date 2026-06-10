@echo off
chcp 65001
echo ========================================
echo   会员积分与等级管理系统 - 启动脚本
echo ========================================
echo.

echo [1/4] 检查 Node.js 环境...
node --version
if errorlevel 1 (
    echo 错误: 未找到 Node.js，请先安装 Node.js >= 16.0.0
    pause
    exit /b 1
)

echo.
echo [2/4] 检查 MySQL 连接...
echo 请确保 MySQL 服务已启动，密码为: password
echo 数据库配置文件: server\.env
pause

echo.
echo [3/4] 安装依赖（首次运行）...
choice /c YN /m "是否安装依赖？(首次运行必须选Y)"
if errorlevel 2 goto skip_install
echo 正在安装依赖，请稍候...
call npm run install:all
if errorlevel 1 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)
echo 依赖安装完成！
:skip_install

echo.
echo [4/4] 初始化数据库（首次运行）...
choice /c YN /m "是否初始化数据库？(首次运行必须选Y)"
if errorlevel 2 goto skip_init
echo 正在初始化数据库...
call npm run init:db
if errorlevel 1 (
    echo 错误: 数据库初始化失败
    pause
    exit /b 1
)
echo 数据库初始化完成！
:skip_init

echo.
echo ========================================
echo   启动开发服务...
echo ========================================
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3001
echo 按 Ctrl+C 停止服务
echo.
call npm run dev
pause
