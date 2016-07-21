/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {HttpResponse} from './HttpResponse';

export interface HttpClient {
    get(url:string, headers?:any):Q.Promise<HttpResponse>
    post(url:string, body:any, headers?:any):Q.Promise<HttpResponse>
    put(url:string, body:any, headers?:any):Q.Promise<HttpResponse>
    head(url:string, headers?:any):Q.Promise<HttpResponse>
    delete(url:string, headers?:any):Q.Promise<HttpResponse>
}