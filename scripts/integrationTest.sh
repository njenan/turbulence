#!/usr/bin/env bash

npm run pre-integration-test

mocha "src/**/__test__/IntegrationTest*.js"

mb stop
