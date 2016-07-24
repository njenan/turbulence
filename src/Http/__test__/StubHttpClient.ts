/// <reference path="../../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {HttpClient} from "../HttpClient";
import {HttpResponse} from "../HttpResponse";

export class StubHttpClient implements HttpClient {
    resp;

    constructor() {
        this.resp = {};
    }

    whenGet(url, options) {
        var stubbedResponse = new StubbedResponse(url);

        if (options && options.headers) {
            this.resp[url] = {};
            this.resp[url][JSON.stringify(options.headers)] = stubbedResponse;
        } else {
            this.resp[url] = stubbedResponse;
        }


        return stubbedResponse;
    }

    whenPost(url, body, options?) {
        var stubbedResponse = new StubbedResponse(url, body);
        var bodyKey = JSON.stringify(body);

        if (!this.resp[url]) {
            this.resp[url] = {};
        }

        if (options && options.headers) {
            this.resp[url][bodyKey] = {};
            this.resp[url][bodyKey][JSON.stringify(options.headers)] = stubbedResponse;
        } else {
            this.resp[url][bodyKey] = stubbedResponse;
        }

        return stubbedResponse;
    }

    whenPut(url, body, options?) {
        var stubbedResponse = new StubbedResponse(url, body);
        var bodyKey = JSON.stringify(body);

        if (!this.resp[url]) {
            this.resp[url] = {};
        }
        
        if (options && options.headers) {
            this.resp[url][bodyKey] = {};
            this.resp[url][bodyKey][JSON.stringify(options.headers)] = stubbedResponse;
        } else {
            this.resp[url][bodyKey] = stubbedResponse;
        }

        return stubbedResponse;
    }

    whenHead(url, options?) {
        var stubbedResponse = new StubbedResponse(url);

        if (options && options.headers) {
            this.resp[url] = {};
            this.resp[url][JSON.stringify(options.headers)] = stubbedResponse;
        } else {
            this.resp[url] = stubbedResponse;
        }

        return stubbedResponse;
    }

    whenDelete(url, options?) {
        var stubbedResponse = new StubbedResponse(url);

        if (options && options.headers) {
            this.resp[url] = {};
            this.resp[url][JSON.stringify(options.headers)] = stubbedResponse;
        } else {
            this.resp[url] = stubbedResponse;
        }

        return stubbedResponse;
    }

    get(url:string, headers?:string) {
        var self = this;
        var deferred = Q.defer<HttpResponse>();

        setTimeout(() => {
            if (headers) {
                var any = self.resp[url][JSON.stringify(headers)];
                deferred.resolve(any ? any.nextResponse() : {});
            } else {
                deferred.resolve(self.resp[url].nextResponse());
            }
        }, self.resp[url].delay);

        return deferred.promise;
    }

    post(url:string, body:any, headers?:any) {
        var self = this;
        var deferred = Q.defer<HttpResponse>();
        var response = self.resp[url][JSON.stringify(body)];

        setTimeout(() => {
            if (headers) {
                var any = response[JSON.stringify(headers)];
                deferred.resolve(any ? any.nextResponse() : {});
            } else {
                deferred.resolve(response.nextResponse());
            }
        }, response.delay);

        return deferred.promise;
    }

    put(url:string, body:any, headers?:any) {
        var self = this;
        var deferred = Q.defer<HttpResponse>();
        var response = self.resp[url][JSON.stringify(body)];

        setTimeout(() => {
            if (headers) {
                var any = response[JSON.stringify(headers)];
                deferred.resolve(any ? any.nextResponse() : {});
            } else {
                deferred.resolve(response.nextResponse());
            }
        }, response.delay);

        return deferred.promise;
    }

    head(url:string, headers?:string) {
        var self = this;
        var deferred = Q.defer<HttpResponse>();

        setTimeout(() => {
            if (headers) {
                var any = self.resp[url][JSON.stringify(headers)];
                deferred.resolve(any ? any.nextResponse() : {});
            } else {
                deferred.resolve(self.resp[url].nextResponse());
            }
        }, self.resp[url].delay);

        return deferred.promise;
    }

    delete(url:string, headers?:string) {
        var self = this;
        var deferred = Q.defer<HttpResponse>();

        setTimeout(() => {
            if (headers) {
                var any = self.resp[url][JSON.stringify(headers)];
                deferred.resolve(any ? any.nextResponse() : {});
            } else {
                deferred.resolve(self.resp[url].nextResponse());
            }
        }, self.resp[url].delay);

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

    headers(headers) {
        this.headers = headers;
        return this;
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