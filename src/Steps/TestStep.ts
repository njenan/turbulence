/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');
import {HttpClient} from "../Http/HttpClient";


export interface TestStep {

    execute<I,O>(http: HttpClient, data?: I): Q.Promise<O>;
}