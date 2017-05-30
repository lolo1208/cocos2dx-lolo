#!/bin/bash

projectDir=$( cd "$( dirname "$0"  )" && pwd  )/../

updateServerDir=$projectDir"../tools/updateServer"


$updateServerDir"/bin/startup.sh"
