@echo off
set projectDir=%~dp0../

set binDir=%cd%
cd..
for %%i in ("%cd%") do set projectName=%%~ni
cd %binDir%

set buildToolDir=%projectDir%../tools/build
set updateServerDir=%projectDir%../tools/updateServer
set writablePath=%USERPROFILE%/AppData/Local/%projectName%

echo %writablePath%
%buildToolDir%/bin/simulator -n %projectName% -v 0.0.0 -p %projectDir% -u %updateServerDir% -w %writablePath%
