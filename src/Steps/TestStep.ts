/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');


export interface TestStep {

    execute<I,O>(data?:I):Q.Promise<O>;
}