@echo off
chcp 65001 >nul
rem Сайтты компьютерде ашу: серверді қосып, браузерді ашады.
rem Бұл терезені жапсаң, сайт тоқтайды.
cd /d "%~dp0"
echo MathPro іске қосылды: http://127.0.0.1:8765/index.html
echo Әкімші панелі: http://127.0.0.1:8765/admin.html
echo Тоқтату үшін осы терезені жап.
start "" "http://127.0.0.1:8765/index.html"
python -m http.server 8765 --bind 127.0.0.1
