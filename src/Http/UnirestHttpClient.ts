/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

//No typings exist for unirest
var unirest = require('unirest');

import {HttpClient} from "./HttpClient";
import {HttpResponse} from "./HttpResponse";

export class UnirestHttpClient implements HttpClient {

    get(url:string, headers?:any):Q.Promise<HttpResponse> {
        var deferred = Q.defer<HttpResponse>();

        var request = unirest.get(url);

        if (headers) {
            request = request.headers(headers);
        }

        request.end(function (response) {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }

    post(url:string, body:any, headers?:any):Q.Promise<HttpResponse> {
        var deferred = Q.defer<HttpResponse>();

        var request = unirest.post(url);

        if (headers) {
            request = request.headers(headers);
        }

        request.send(body).end(function (response) {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }

    put(url:string, body:any, headers?:any):Q.Promise<HttpResponse> {
        var deferred = Q.defer<HttpResponse>();

        var request = unirest.put(url);

        if (headers) {
            request = request.headers(headers);
        }

        request.send(body).end(function (response) {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }

    head(url:string, headers?:any):Q.Promise<HttpResponse> {
        var deferred = Q.defer<HttpResponse>();

        var request = unirest.head(url);

        if (headers) {
            request = request.headers(headers);
        }

        request.end(function (response) {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }

    delete(url:string, headers?:any):Q.Promise<HttpResponse> {
        var deferred = Q.defer<HttpResponse>();

        var request = unirest.delete(url);

        if (headers) {
            request = request.headers(headers);
        }

        request.end(function (response) {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }
}
