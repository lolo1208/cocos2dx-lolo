@echo off
set projectDir=%~dp0../

set binDir=%cd%
cd..
for %%i in ("%cd%") do set projectName=%%~ni
cd %binDir%

set buildToolDir=%projectDir%../tools/build
set writablePath=%USERPROFILE%/AppData/Local/%projectName%

cmd /k %buildToolDir%/bin/simulator -n %projectName% -v 0.0.0 -p %projectDir% -w %writablePath%
