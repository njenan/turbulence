/// <reference path="../typings/q/Q.d.ts" />

import Q = require('q');

import {HttpClient} from './HttpClient';
import {HttpResponse} from "./HttpResponse";
import {SummaryResults} from "./SummaryResults";
import {TestPlan} from "./TestPlan";
import all = Q.all;

export class Turbulence {
    http:HttpClient;
    testPlans:Array<TestPlan>;


    constructor(http) {
        this.http = http;
        this.testPlans = [];
    };

    startTest() {
        var testPlan = new TestPlan(this, this.http);
        this.testPlans.unshift(testPlan);
        return testPlan;
    }

    run():Q.Promise<SummaryResults> {
        var deferred = Q.defer<SummaryResults>();
        deferred.resolve();

        var allResults:SummaryResults[] = [];

        return this.testPlans.reduce(function (promise:Q.Promise<SummaryResults>, nextTestPlan:TestPlan):Q.Promise<SummaryResults> {
                return promise.then(function ():Q.Promise<SummaryResults> {
                    var result = nextTestPlan.run();

                    return result.then(function (results) {
                        allResults.push(results);
                        return results;
                    });
                });
            }, deferred.promise)
            .then(function ():SummaryResults {

                var summaryResults = allResults.reduce(function (left, right) {
                    right.errors = right.errors + left.errors;
                    return right;
                });

                return summaryResults;
            });

    }

}