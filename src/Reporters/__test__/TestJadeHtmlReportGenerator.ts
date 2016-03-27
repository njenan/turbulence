/// <reference path="../../../typings/main/ambient/xmldom/index.d.ts" />
/// <reference path="../../../typings/main/ambient/xpath/index.d.ts" />
/// <reference path="../../../typings/main/ambient/assert/index.d.ts" />

import xpath = require('xpath');
import xmldom = require('xmldom');
import assert = require('power-assert');

import {JadeHtmlReportGenerator} from "../JadeHtmlReportGenerator";
import {SummaryResults} from "../../Results/SummaryResults";
import {StubFs} from "./StubFs";

describe('JadeHtmlReportGenerator', function () {
    var generator:JadeHtmlReportGenerator;
    var stubFs;

    /*
     {
     type: 'GET',
     url: self.url,
     status: resp.statusCode,
     error: false,
     duration: duration
     }
     */

    beforeEach(function () {
        stubFs = new StubFs();
        generator = new JadeHtmlReportGenerator(stubFs);
    });

    it('should report total number of requests', function () {
        var results = new SummaryResults();
        results.requests.push({
            url: 'http://localhost:8080/'
        });
        results.requests.push({
            url: 'http://localhost:8081/'
        });

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('Total Requests: 2', xpath.select('//*[@class="TotalRequests"]', doc)[0].firstChild.data);
    });

    it('should report each step separately', function () {
        var results = new SummaryResults();
        results.requests.push({
            url: 'http://localhost:8080/'
        });
        results.requests.push({
            url: 'http://localhost:8081/'
        });
        results.requests.push({
            url: 'http://localhost:8082/'
        });

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('Url: http://localhost:8080/ Invocations: 1', xpath.select('//*[@class="Url"]', doc)[0].firstChild.data);
        assert.equal('Url: http://localhost:8081/ Invocations: 1', xpath.select('//*[@class="Url"]', doc)[1].firstChild.data);
        assert.equal('Url: http://localhost:8082/ Invocations: 1', xpath.select('//*[@class="Url"]', doc)[2].firstChild.data);
    });

    it('should count how many times each url was accessed', function () {
        var results = new SummaryResults();
        results.requests.push({
            url: 'http://localhost:8080/'
        });
        results.requests.push({
            url: 'http://localhost:8080/'
        });

        generator.toReport(results);

        var html = stubFs.data;
        var doc = new xmldom.DOMParser().parseFromString(html);

        assert.equal('Url: http://localhost:8080/ Invocations: 2', xpath.select('//*[@class="Url"]', doc)[0].firstChild.data);
    });

});
