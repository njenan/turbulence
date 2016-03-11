/// <reference path="../../typings/q/Q.d.ts" />

import Q = require('q');

import {HttpClient} from "../HttpClient";
import {HttpResponse} from "../HttpResponse";

export class StubHttp implements HttpClient {
    resp:HttpResponse;

    triggerNextHttpResponse() {

    }

    whenGet(url) {
        return this;
    }

    thenReturn(resp) {
        this.resp = resp;
    }

    get(url:String) {
        var self = this;
        var deferred = Q.defer<HttpResponse>();

        setTimeout(function () {
            deferred.resolve(self.resp);
        }, 0);

        return deferred.promise;
    }
}
