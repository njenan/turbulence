#!/usr/bin/env bash

plugins=$(ls plugins)

cd plugins;

for plugin in ${plugins}
do
    cd ${plugin}
    npm run all
    cd ../
done

cd ../
