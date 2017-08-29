#!/bin/bash

port=8001

projectDir=$( cd "$( dirname "$0"  )" && pwd  )/../

httpServerDir=$projectDir"../tools/httpServer"


$httpServerDir"/bin/startup.sh" -p $port -d $projectDir
