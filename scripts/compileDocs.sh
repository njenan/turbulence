#!/usr/bin/env bash
set -e

typedoc --json docs/_data/api.json ./src/Turbulence.ts ./src/Steps/StepCreator.ts --tsconfig typedoc-tsconfig.json --ignoreCompilerErrors --readme none --excludePrivate --mode file;
node ./scripts/transformApiData.js;