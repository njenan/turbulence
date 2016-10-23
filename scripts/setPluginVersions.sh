#!/usr/bin/env bash

set -e

VERSION=$(env | grep npm_package_version | sed -E 's/.*=(.*)/\1/')
PLUGINS=$(ls plugins/)
cd plugins/

for DIR in $PLUGINS
do
    cd $DIR
    npm version $VERSION
    cd "../"
done
