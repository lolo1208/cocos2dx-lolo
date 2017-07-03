#!/bin/bash

binDir=$( cd "$( dirname "$0"  )" && pwd  )/

projectDir=$binDir../

cd $projectDir

projectName=`basename $PWD`

cd $binDir

buildToolDir=$projectDir../tools/build
writablePath=/Users/limylee/Library/Developer/CoreSimulator/Devices/5F6A3C6D-9197-4F25-9384-CFE1B50A0A1E/data/Containers/Data/Application

$buildToolDir/bin/simulator.sh -n $projectName -v 0.0.0 -p $projectDir -w $writablePath