import assert = require('power-assert');

import {SummaryResults} from '../SummaryResults';
import {HttpRequestRecord} from '../../Steps/Http/HttpRequestRecord';
import {HttpGetStep} from '../../Steps/Http/HttpGetStep';
import {HttpResponse} from '../../Http/HttpResponse';

describe('Summary Results', () => {
    describe('averageResponseTime', () => {
        it('should return the average all requests', () => {
            let results = new SummaryResults(null);
            results.requests.push(new HttpRequestRecord(
                new HttpGetStep(undefined, undefined, undefined), new HttpResponse(), 1, 0));
            results.requests.push(new HttpRequestRecord(
                new HttpGetStep(undefined, undefined, undefined), new HttpResponse(), 2, 0));
            results.requests.push(new HttpRequestRecord(
                new HttpGetStep(undefined, undefined, undefined), new HttpResponse(), 3, 0));

            assert.equal(2, results.averageResponseTime());

        });

        it('should return the average response for a specific url', () => {
            let results = new SummaryResults(null);
            results.requests.push(new HttpRequestRecord(
                new HttpGetStep(undefined, 'http://localhost:8080/a', undefined), new HttpResponse(), 10, 0));
            results.requests.push(new HttpRequestRecord(
                new HttpGetStep(undefined, 'http://localhost:8080/a', undefined), new HttpResponse(), 30, 0));
            results.requests.push(new HttpRequestRecord(
                new HttpGetStep(undefined, 'http://localhost:8080/b', undefined), new HttpResponse(), 1000, 0));

            assert.equal(20, results.averageResponseTime('http://localhost:8080/a'));
        });

    });

    describe('requestMap', () => {
        it('should return a map of each url with response times', () => {
            let results = new SummaryResults(null);
            results.requests.push(new HttpRequestRecord(
                new HttpGetStep(undefined, 'http://localhost:8080/a', undefined), new HttpResponse(), 10, 0));
            results.requests.push(new HttpRequestRecord(
                new HttpGetStep(undefined, 'http://localhost:8080/a', undefined), new HttpResponse(), 30, 0));
            results.requests.push(new HttpRequestRecord(
                new HttpGetStep(undefined, 'http://localhost:8080/b', undefined), new HttpResponse(), 1000, 0));
            results.requests.push(new HttpRequestRecord(
                new HttpGetStep(undefined, 'http://localhost:8080/b', undefined), new HttpResponse(), 3000, 0));
            results.requests.push(new HttpRequestRecord(
                new HttpGetStep(undefined, 'http://localhost:8080/c', undefined), new HttpResponse(), 10000, 0));

            let summation = results.requestMap();

            assert.equal(20, summation['http://localhost:8080/a'].averageResponseTime());
            assert.equal(2000, summation['http://localhost:8080/b'].averageResponseTime());
            assert.equal(10000, summation['http://localhost:8080/c'].averageResponseTime());
        });

    });

    it('should group responses into 100 millisecond intervals', () => {
        let results = new SummaryResults(null);
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8080/a', undefined), new HttpResponse(), 1, 0));
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8080/a', undefined), new HttpResponse(), 1, 0));
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8080/b', undefined), new HttpResponse(), 1, 101));
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8080/b', undefined), new HttpResponse(), 1, 101));
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8080/c', undefined), new HttpResponse(), 1, 201));

        let summation = results.responsesPerInterval(100);

        assert.equal(1, summation.pop().y);
        assert.equal(2, summation.pop().y);
        assert.equal(2, summation.pop().y);
    });

});
