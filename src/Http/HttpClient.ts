/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {HttpResponse} from './HttpResponse';

export interface HttpClient {
    get(url:String):Q.Promise<HttpResponse>
    post(url:String, body:any):Q.Promise<HttpResponse>
    put(url:String, body:any):Q.Promise<HttpResponse>
    head(url:String):Q.Promise<HttpResponse>
    delete(url:String):Q.Promise<HttpResponse>
}