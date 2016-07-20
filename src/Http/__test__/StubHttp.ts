/// <reference path="../../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {HttpClient} from "../HttpClient";
import {HttpResponse} from "../HttpResponse";

export class StubHttp implements HttpClient {
    resp;

    constructor() {
        this.resp = {};
    }

    whenGet(url) {
        var stubbedResponse = new StubbedResponse(url);
        this.resp[url] = stubbedResponse;

        return stubbedResponse;
    }

    whenPost(url, body) {
        var stubbedResponse = new StubbedResponse(url, body);
        var bodyKey = JSON.stringify(body);

        if (!this.resp[url]) {
            this.resp[url] = {};
        }

        this.resp[url][bodyKey] = stubbedResponse;

        return stubbedResponse;
    }

    get(url:string) {
        var self = this;
        var deferred = Q.defer<HttpResponse>();

        setTimeout(function () {
            deferred.resolve(self.resp[url].nextResponse());
        }, self.resp[url].delay);

        return deferred.promise;
    }

    post(url:string, body:any) {
        var self = this;
        var deferred = Q.defer<HttpResponse>();
        var response = self.resp[url][JSON.stringify(body)];

        setTimeout(function () {
            deferred.resolve(response.nextResponse());
        }, response.delay);

        return deferred.promise;
    }
}

class StubbedResponse {
    url:String;
    body:any;
    responses:Array<HttpResponse>;
    delay:number;

    constructor(url, body?) {
        this.url = url;
        this.body = body;
        this.responses = [];
    }

    thenReturn(...resp) {
        this.responses = this.responses.concat(resp);
        return this;
    }

    delayResponse(ms) {
        this.delay = ms;
    }

    nextResponse() {
        return this.responses.length > 1 ? this.responses.shift() : this.responses[0];
    }
}