/// <reference path="../../typings/main/ambient/assert/index.d.ts" />

import assert = require('power-assert');

import {SummaryResults} from "../Results/SummaryResults";

describe('Summary Results', function () {
    describe('averageResponseTime', function () {
        it('should return the average all requests', function () {
            var results = new SummaryResults();
            results.requests.push({
                duration: 1
            });
            results.requests.push({
                duration: 2
            });
            results.requests.push({
                duration: 3
            });

            assert.equal(2, results.averageResponseTime());

        });

        it('should return the average response for a specific url', function () {
            var results = new SummaryResults();
            results.requests.push({
                url: 'http://localhost:8080/a',
                duration: 10
            });
            results.requests.push({
                url: 'http://localhost:8080/a',
                duration: 30
            });
            results.requests.push({
                url: 'http://localhost:8080/b',
                duration: 1000
            });

            assert.equal(20, results.averageResponseTime('http://localhost:8080/a'));
        });

    });

    describe('requestMap', function () {
        it('should return a map of each url with response times', function () {
            var results = new SummaryResults();
            results.requests.push({
                url: 'http://localhost:8080/a',
                duration: 10
            });
            results.requests.push({
                url: 'http://localhost:8080/a',
                duration: 30
            });
            results.requests.push({
                url: 'http://localhost:8080/b',
                duration: 1000
            });
            results.requests.push({
                url: 'http://localhost:8080/b',
                duration: 3000
            });
            results.requests.push({
                url: 'http://localhost:8080/c',
                duration: 10000
            });

            var summation = results.requestMap();

            assert.equal(20, summation['http://localhost:8080/a'].averageResponseTime());
            assert.equal(2000, summation['http://localhost:8080/b'].averageResponseTime());
            assert.equal(10000, summation['http://localhost:8080/c'].averageResponseTime());
        });

    });

});
