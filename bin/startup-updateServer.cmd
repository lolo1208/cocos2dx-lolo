@echo off
set projectDir=%~dp0../


set updateServerDir=%projectDir%../tools/updateServer


%updateServerDir%/bin/startup
