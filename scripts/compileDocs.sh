#!/usr/bin/env bash
set -e

typedoc --out docs/_api ./src/Turbulence.ts --ignoreCompilerErrors --readme none --excludePrivate --mode file;
cat docs/css/main.css >> docs/_api/assets/css/main.css
cat docs/append.css >> docs/_api/assets/css/main.css
