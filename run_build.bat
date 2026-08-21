@echo off
chcp 65001 > nul
cd /d "%~dp0"
title Portfolio Builder

echo [i] Оновлення даних портфоліо...
python build_data.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [✓] Успішно оновлено!
    timeout /t 2 > nul
) else (
    echo.
    echo [!] Виникла помилка під час виконання build_data.py
    pause
)