@echo off

set port=8001

set projectDir=%~dp0../

set httpServerDir=%projectDir%../tools/httpServer


%httpServerDir%/bin/startup -p %port% -d %projectDir%
