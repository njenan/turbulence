/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

//No typings exist for unirest
var unirest = require('unirest');

import {HttpClient} from "./HttpClient";
import {HttpResponse} from "./HttpResponse";

export class UnirestHttpClient implements HttpClient {

    get(url:string, headers?:any):Q.Promise<HttpResponse> {
        return this.request(unirest.get, url, null, headers);
    }

    post(url:string, body:any, headers?:any):Q.Promise<HttpResponse> {
        return this.request(unirest.post, url, body, headers);
    }

    put(url:string, body:any, headers?:any):Q.Promise<HttpResponse> {
        return this.request(unirest.put, url, body, headers);
    }

    head(url:string, headers?:any):Q.Promise<HttpResponse> {
        return this.request(unirest.head, url, null, headers);
    }

    delete(url:string, headers?:any):Q.Promise<HttpResponse> {
        return this.request(unirest.delete, url, null, headers);
    }

    request(request, url, body, headers) {
        var deferred = Q.defer<HttpResponse>();

        request = request(url).headers(headers);

        if (body) {
            request = request.send(body);
        }

        request.end(function (response) {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }
}
