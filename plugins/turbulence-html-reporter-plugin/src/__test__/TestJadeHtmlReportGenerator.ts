import xpath = require('xpath');
import xmldom = require('xmldom');
import assert = require('power-assert');

import {JadeHtmlReportGenerator} from "../../src/JadeHtmlReportGenerator";
import {SummaryResults} from "../../../../src/Results/SummaryResults";
import {StubFs} from "./StubFs";
import {HttpGetStep} from "../../../../src/Steps/Http/HttpGetStep";
import {HttpRequestRecord} from "../../../../src/Steps/Http/HttpRequestRecord";
import {HttpResponse} from "../../../../src/Http/HttpResponse";

describe('JadeHtmlReportGenerator', () => {
    var generator: JadeHtmlReportGenerator;
    var stubFs;

    beforeEach(() => {
        stubFs = new StubFs();
        generator = new JadeHtmlReportGenerator(stubFs);
    });

    it('should report total number of requests', () => {
        var results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0));

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('2', xpath.select('//*[@class="TotalRequests"]', doc)[0].firstChild.data);
    });

    it('should report each step separately', () => {
        var results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8082/', undefined), new HttpResponse(), undefined, 0));

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('http://localhost:8080/', xpath.select('//*[@class="Url"]', doc)[0].firstChild.data);
        assert.equal('http://localhost:8081/', xpath.select('//*[@class="Url"]', doc)[1].firstChild.data);
        assert.equal('http://localhost:8082/', xpath.select('//*[@class="Url"]', doc)[2].firstChild.data);
    });

    it('should count how many times each url was accessed', () => {
        var results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined, 0));

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('2', xpath.select('//*[@class="Invocations"]', doc)[0].firstChild.data);
    });

    it('should preserve order of url invocations', () => {
        var results = new SummaryResults();
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0));

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
        results.requests.push(new HttpRequestRecord(new HttpGetStep('http://localhost:8081/', undefined), new HttpResponse(), undefined, 0));

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('0%', xpath.select('//*[@class="ErrorRate"]', doc)[0].firstChild.data);
    });

    xit('should calculate the error rate', () => {
        var results = new SummaryResults();

        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), undefined, 0));
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
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse(), 10, 0));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse(), 20, 0));
        results.requests.push(new HttpRequestRecord(new HttpGetStep(undefined, 'http://localhost:8082/', undefined), new HttpResponse(), 30, 0));

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('20', xpath.select('//*[@class="TotalAverageResponseTime"]', doc)[0].firstChild.data);
    });

});
