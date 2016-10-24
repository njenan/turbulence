import xpath = require('xpath');
import xmldom = require('xmldom');
import assert = require('power-assert');

import fs = require('fs');

import {JadeHtmlReportGenerator} from '../../src/JadeHtmlReportGenerator';
import {SummaryResults} from '../../../../src/Results/SummaryResults';
import {HttpGetStep} from '../../../../src/Steps/Http/HttpGetStep';
import {HttpRequestRecord} from '../../../../src/Steps/Http/HttpRequestRecord';
import {HttpResponse} from '../../../../src/Http/HttpResponse';

describe('JadeHtmlReportGenerator', () => {
    let domParser = new xmldom.DOMParser({
        locator: {},
        errorHandler: {
            warning: function () {
            },
            error: function () {
            },
            fatalError: function () {
            }
        }
    });
    let generator: JadeHtmlReportGenerator;
    let data;
    let temp;

    beforeEach(() => {
        generator = new JadeHtmlReportGenerator();
        temp = fs.writeFile;
        fs.writeFile = function (path, chunk) {
            data = chunk;
        };
    });

    afterEach(() => {
        fs.writeFile = temp;
    });

    it('should report total number of requests', () => {
        let results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined, 0)
        );
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0)
        );

        generator.toReport(results);

        let html = data;
        let doc = domParser.parseFromString(html);

        assert.equal('2', xpath.select('//*[@class="TotalRequests"]', doc)[0].firstChild.data);
    });

    it('should allow http requests to be labeled', () => {
        return null;
    });

    it('should write an html report after executing', () => {
        return null;
    });

    it('should report each step separately', () => {
        let results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined, 0)
        );
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0)
        );
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8082/', undefined), new HttpResponse(), undefined, 0)
        );

        generator.toReport(results);

        let html = data;
        let doc = domParser.parseFromString(html);

        assert.equal('http://localhost:8080/', xpath.select('//*[@class="Url"]', doc)[0].firstChild.data);
        assert.equal('http://localhost:8081/', xpath.select('//*[@class="Url"]', doc)[1].firstChild.data);
        assert.equal('http://localhost:8082/', xpath.select('//*[@class="Url"]', doc)[2].firstChild.data);
    });

    it('should count how many times each url was accessed', () => {
        let results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined, 0)
        );
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined, 0)
        );

        generator.toReport(results);

        let html = data;
        let doc = domParser.parseFromString(html);

        assert.equal('2', xpath.select('//*[@class="Invocations"]', doc)[0].firstChild.data);
    });

    it('should preserve order of url invocations', () => {
        let results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0)
        );
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined, 0)
        );
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0)
        );

        generator.toReport(results);

        let html = data;
        let doc = domParser.parseFromString(html);

        assert.equal('http://localhost:8081/', xpath.select('//*[@class="Url"]', doc)[0].firstChild.data);
        assert.equal('http://localhost:8080/', xpath.select('//*[@class="Url"]', doc)[1].firstChild.data);
        assert.equal('2', xpath.select('//*[@class="Invocations"]', doc)[0].firstChild.data);
        assert.equal('1', xpath.select('//*[@class="Invocations"]', doc)[1].firstChild.data);
    });

    it('should show a 0% error rate if no errors occured', () => {
        let results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep('http://localhost:8081/', undefined), new HttpResponse(), undefined, 0)
        );

        generator.toReport(results);

        let html = data;
        let doc = domParser.parseFromString(html);

        assert.equal('0%', xpath.select('//*[@class="ErrorRate"]', doc)[0].firstChild.data);
    });

    xit('should calculate the error rate', () => {
        let results = new SummaryResults();

        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0)
        );
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0)
        );
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0)
        );

        generator.toReport(results);

        let html = data;
        let doc = domParser.parseFromString(html);

        assert.equal('33.33%', xpath.select('//*[@class="ErrorRate"]', doc)[0].firstChild.data);
    });

    it('should calculate the total average response time', () => {
        let results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), 10, 0)
        );
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), 20, 0)
        );
        results.requests.push(new HttpRequestRecord(
            new HttpGetStep(undefined, 'http://localhost:8082/', undefined), new HttpResponse(), 30, 0)
        );

        generator.toReport(results);

        let html = data;
        let doc = domParser.parseFromString(html);

        assert.equal('20', xpath.select('//*[@class="TotalAverageResponseTime"]', doc)[0].firstChild.data);
    });
});
