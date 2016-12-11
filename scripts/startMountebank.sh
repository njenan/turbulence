#!/usr/bin/env bash

nohup mb --mock &

while [ ! -f ./mb.pid ]
do
  sleep 1
done
