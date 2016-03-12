/// <reference path="../../typings/q/Q.d.ts" />

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

    get(url:string) {
        var self = this;
        var deferred = Q.defer<HttpResponse>();

        setTimeout(function () {
            deferred.resolve(self.resp[url].nextResponse());
        }, 0);

        return deferred.promise;
    }
}

class StubbedResponse {
    url:String;
    responses:Array<HttpResponse>;

    constructor(url) {
        this.url = url;
        this.responses = [];
    }

    thenReturn(...resp) {
        this.responses = this.responses.concat(resp);
    }

    nextResponse() {
        return this.responses.length > 1 ? this.responses.pop() : this.responses[0];
    }
}