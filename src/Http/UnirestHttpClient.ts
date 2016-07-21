/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

//No typings exist for unirest
var unirest = require('unirest');

import {HttpClient} from "./HttpClient";
import {HttpResponse} from "./HttpResponse";

export class UnirestHttpClient implements HttpClient {

    get(url:string):Q.Promise<HttpResponse> {
        var deferred = Q.defer<HttpResponse>();

        unirest.get(url).end(function (response) {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }

    post(url:string, body:any):Q.Promise<HttpResponse> {
        var deferred = Q.defer<HttpResponse>();

        unirest.post(url).send(body).end(function (response) {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }

    put(url:string, body:any):Q.Promise<HttpResponse> {
        var deferred = Q.defer<HttpResponse>();

        unirest.put(url).send(body).end(function (response) {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }

    head(url:string):Q.Promise<HttpResponse> {
        var deferred = Q.defer<HttpResponse>();

        unirest.head(url).end(function (response) {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }

    delete(url:string):Q.Promise<HttpResponse> {
        var deferred = Q.defer<HttpResponse>();

        unirest.delete(url).end(function (response) {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }
}
