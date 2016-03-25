/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {HttpResponse} from './HttpResponse';

export interface HttpClient {
    get(url:String): Q.Promise<HttpResponse>
}