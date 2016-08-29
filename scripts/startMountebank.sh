#!/usr/bin/env bash


nohup mb start --mock &

while [ ! -f ./mb.pid ]
do
  sleep 1
done
