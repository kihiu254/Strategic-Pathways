@echo off
set "filepath=c:\Users\evince\Downloads\Kimi_Agent_Strategic Pathways Onboarding Video\app\src\sections\AdminDashboard.tsx"
powershell -Command "(Get-Content -Path '%filepath%' -Encoding unicode) | Set-Content -Path '%filepath%' -Encoding utf8"
if %errorlevel% equ 0 (
    echo Successfully converted to UTF-8
) else (
    echo Failed to convert
)
