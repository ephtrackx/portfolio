@echo off
chcp 65001 > nul
cd /d "%~dp0"
title Portfolio Builder & Publisher

echo [i] Оновлення даних та відправка на GitHub...
python build_data.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [✓] Все готово! Сайт оновиться на GitHub Pages через 1-2 хвилини.
    timeout /t 3 > nul
) else (
    echo.
    echo [!] Виникла помилка під час виконання.
    pause
)