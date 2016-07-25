/// <reference path="../../../typings/main/ambient/xmldom/index.d.ts" />
/// <reference path="../../../typings/main/ambient/xpath/index.d.ts" />
/// <reference path="../../../typings/main/ambient/assert/index.d.ts" />

import xpath = require('xpath');
import xmldom = require('xmldom');
import assert = require('power-assert');

import {JadeHtmlReportGenerator} from "../JadeHtmlReportGenerator";
import {SummaryResults} from "../../Results/SummaryResults";
import {StubFs} from "./StubFs";
import {HttpGetStep} from "../../Steps/Http/HttpGetStep";
import {HttpRequestRecord} from "../../Steps/Http/HttpRequestRecord";
import {HttpResponse} from "../../Http/HttpResponse";

require("mocha-as-promised")();

describe('JadeHtmlReportGenerator', () => {
    var generator:JadeHtmlReportGenerator;
    var stubFs;

    beforeEach(() => {
        stubFs = new StubFs();
        generator = new JadeHtmlReportGenerator(stubFs);
    });

    it('should report total number of requests', () => {
        var results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined));

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('2', xpath.select('//*[@class="TotalRequests"]', doc)[0].firstChild.data);
    });

    it('should report each step separately', () => {
        var results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8082/', undefined), new HttpResponse(), undefined));

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('http://localhost:8080/', xpath.select('//*[@class="Url"]', doc)[0].firstChild.data);
        assert.equal('http://localhost:8081/', xpath.select('//*[@class="Url"]', doc)[1].firstChild.data);
        assert.equal('http://localhost:8082/', xpath.select('//*[@class="Url"]', doc)[2].firstChild.data);
    });

    it('should count how many times each url was accessed', () => {
        var results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined));

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('2', xpath.select('//*[@class="Invocations"]', doc)[0].firstChild.data);
    });

    it('should preserve order of url invocations', () => {
        var results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined));

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('http://localhost:8081/', xpath.select('//*[@class="Url"]', doc)[0].firstChild.data);
        assert.equal('http://localhost:8080/', xpath.select('//*[@class="Url"]', doc)[1].firstChild.data);
        assert.equal('2', xpath.select('//*[@class="Invocations"]', doc)[0].firstChild.data);
        assert.equal('1', xpath.select('//*[@class="Invocations"]', doc)[1].firstChild.data);
    });

    it('should show a 0% error rate if no errors occured', () => {
        var results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined));

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('0%', xpath.select('//*[@class="ErrorRate"]', doc)[0].firstChild.data);
    });

    xit('should calculate the error rate', () => {
        var results = new SummaryResults();

        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined));
        /*
         results.requests.push({
         url: 'http://localhost:8081/',
         error: true
         });
         results.requests.push({
         url: 'http://localhost:8081/'np
         });
         results.requests.push({
         url: 'http://localhost:8081/'
         });
         */

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('33.33%', xpath.select('//*[@class="ErrorRate"]', doc)[0].firstChild.data);
    });

    it('should calculate the total average response time', () => {
        var results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8080/', undefined), new HttpResponse(), 10));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8081/', undefined), new HttpResponse(), 20));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, undefined, undefined, 'http://localhost:8082/', undefined), new HttpResponse(), 30));

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('20', xpath.select('//*[@class="TotalAverageResponseTime"]', doc)[0].firstChild.data);
    });

});
