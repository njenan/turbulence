"use strict";
var xpath = require('xpath');
var xmldom = require('xmldom');
var assert = require('power-assert');
var JadeHtmlReportGenerator_1 = require("../../src/JadeHtmlReportGenerator");
var SummaryResults_1 = require("../../../../src/Results/SummaryResults");
var StubFs_1 = require("./StubFs");
var HttpGetStep_1 = require("../../../../src/Steps/Http/HttpGetStep");
var HttpRequestRecord_1 = require("../../../../src/Steps/Http/HttpRequestRecord");
var HttpResponse_1 = require("../../../../src/Http/HttpResponse");
describe('JadeHtmlReportGenerator', function () {
    var generator;
    var stubFs;
    beforeEach(function () {
        stubFs = new StubFs_1.StubFs();
        generator = new JadeHtmlReportGenerator_1.JadeHtmlReportGenerator(stubFs);
    });
    it('should report total number of requests', function () {
        var results = new SummaryResults_1.SummaryResults();
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        generator.toReport(results);
        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);
        assert.equal('2', xpath.select('//*[@class="TotalRequests"]', doc)[0].firstChild.data);
    });
    it('should allow http requests to be labeled', function () {
    });
    it('should write an html report after executing', function () {
        // fs.unlinkSync('Report.html');
        // return TurbulenceCli({args: 'examples/example2.turbulence'}).then(() => {
        //            assert.ok(fs.statSync('Report.html').isFile());
        //      });
    });
    it('should report each step separately', function () {
        var results = new SummaryResults_1.SummaryResults();
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8082/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        generator.toReport(results);
        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);
        assert.equal('http://localhost:8080/', xpath.select('//*[@class="Url"]', doc)[0].firstChild.data);
        assert.equal('http://localhost:8081/', xpath.select('//*[@class="Url"]', doc)[1].firstChild.data);
        assert.equal('http://localhost:8082/', xpath.select('//*[@class="Url"]', doc)[2].firstChild.data);
    });
    it('should count how many times each url was accessed', function () {
        var results = new SummaryResults_1.SummaryResults();
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        generator.toReport(results);
        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);
        assert.equal('2', xpath.select('//*[@class="Invocations"]', doc)[0].firstChild.data);
    });
    it('should preserve order of url invocations', function () {
        var results = new SummaryResults_1.SummaryResults();
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        generator.toReport(results);
        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);
        assert.equal('http://localhost:8081/', xpath.select('//*[@class="Url"]', doc)[0].firstChild.data);
        assert.equal('http://localhost:8080/', xpath.select('//*[@class="Url"]', doc)[1].firstChild.data);
        assert.equal('2', xpath.select('//*[@class="Invocations"]', doc)[0].firstChild.data);
        assert.equal('1', xpath.select('//*[@class="Invocations"]', doc)[1].firstChild.data);
    });
    it('should show a 0% error rate if no errors occured', function () {
        var results = new SummaryResults_1.SummaryResults();
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep('http://localhost:8081/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        generator.toReport(results);
        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);
        assert.equal('0%', xpath.select('//*[@class="ErrorRate"]', doc)[0].firstChild.data);
    });
    xit('should calculate the error rate', function () {
        var results = new SummaryResults_1.SummaryResults();
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse_1.HttpResponse(), undefined, 0));
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
    it('should calculate the total average response time', function () {
        var results = new SummaryResults_1.SummaryResults();
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8080/', undefined), new HttpResponse_1.HttpResponse(), 10, 0));
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8081/', undefined), new HttpResponse_1.HttpResponse(), 20, 0));
        results.requests.push(new HttpRequestRecord_1.HttpRequestRecord(new HttpGetStep_1.HttpGetStep(undefined, 'http://localhost:8082/', undefined), new HttpResponse_1.HttpResponse(), 30, 0));
        generator.toReport(results);
        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);
        assert.equal('20', xpath.select('//*[@class="TotalAverageResponseTime"]', doc)[0].firstChild.data);
    });
});
