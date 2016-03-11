/// <reference path="../typings/q/Q.d.ts" />

import Q = require('q');

import {HttpResponse} from './HttpResponse';

export interface HttpClient {
    get(url:String): Q.Promise<HttpResponse>
}