#!/usr/bin/env bash

set -e

plugins=$(ls plugins)

cd plugins;

for plugin in ${plugins}
do
    cd ${plugin}
    npm install
    npm run all
    cd ../
done

cd ../
