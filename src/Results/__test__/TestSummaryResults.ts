/// <reference path="../../../typings/main/ambient/assert/index.d.ts" />

import assert = require('power-assert');

import {SummaryResults} from "../SummaryResults";
import {HttpRequestRecord} from "../../Steps/Http/HttpRequestRecord";
import {HttpGetStep} from "../../Steps/Http/HttpGetStep";
import {HttpResponse} from "../../Http/HttpResponse";

require("mocha-as-promised")();

describe('Summary Results', () => {
    describe('averageResponseTime', () => {
        it('should return the average all requests', () => {
            var results = new SummaryResults();
            results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, undefined, undefined), new HttpResponse(), 1));
            results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, undefined, undefined), new HttpResponse(), 2));
            results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, undefined, undefined), new HttpResponse(), 3));

            assert.equal(2, results.averageResponseTime());

        });

        it('should return the average response for a specific url', () => {
            var results = new SummaryResults();
            results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/a', undefined), new HttpResponse(), 10));
            results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/a', undefined), new HttpResponse(), 30));
            results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/b', undefined), new HttpResponse(), 1000));

            assert.equal(20, results.averageResponseTime('http://localhost:8080/a'));
        });

    });

    describe('requestMap', () => {
        it('should return a map of each url with response times', () => {
            var results = new SummaryResults();
            results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/a', undefined), new HttpResponse(), 10));
            results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/a', undefined), new HttpResponse(), 30));
            results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/b', undefined), new HttpResponse(), 1000));
            results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/b', undefined), new HttpResponse(), 3000));
            results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/c', undefined), new HttpResponse(), 10000));

            var summation = results.requestMap();

            assert.equal(20, summation['http://localhost:8080/a'].averageResponseTime());
            assert.equal(2000, summation['http://localhost:8080/b'].averageResponseTime());
            assert.equal(10000, summation['http://localhost:8080/c'].averageResponseTime());
        });

    });

});
