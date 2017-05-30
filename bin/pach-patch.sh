#!/bin/bash

projectDir=$( cd "$( dirname "$0"  )" && pwd  )/../

updateServerDir=$projectDir"../tools/updateServer"


$updateServerDir"/bin/startup.sh"



@echo off
set projectDir=%~dp0../

set binDir=%cd%
cd..
for %%i in ("%cd%") do set projectName=%%~ni
cd %binDir%

set buildToolDir=%projectDir%../tools/build
set updateServerDir=%projectDir%../tools/updateServer


%buildToolDir%/bin/patch -n %projectName% -v 0.0.0 -p %projectDir% -u %updateServerDir%
