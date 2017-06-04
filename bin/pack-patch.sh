#!/bin/bash

binDir=$( cd "$( dirname "$0"  )" && pwd  )/

projectDir=$binDir../

cd $projectDir

projectName=`basename $PWD`

cd $binDir

buildToolDir=$projectDir../tools/build
updateServerDir=$projectDir../tools/updateServer

$buildToolDir"/bin/patch.sh" -n $projectName -v 0.0.0 -p $projectDir -u $updateServerDir