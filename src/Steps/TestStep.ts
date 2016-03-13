/// <reference path="../../typings/q/Q.d.ts" />

import Q = require('q');

import {SummaryResults} from "../SummaryResults";


export interface TestStep {

    execute<I,O>(data?:I): Q.Promise<O>;
}