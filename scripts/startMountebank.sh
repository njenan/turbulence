#!/usr/bin/env bash


nohup mb start &

while [ ! -f ./mb.pid ]
do
  sleep 1
done
