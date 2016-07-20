/// <reference path="../typings/main/ambient/q/index.d.ts" />

import Q = require('q');
import fs = require('fs');

import {HttpClient} from './Http/HttpClient';
import {HttpResponse} from "./Http/HttpResponse";
import {SummaryResults} from "./Results/SummaryResults";
import {TestPlan} from "./TestPlan";
import {LocalExecutor} from "./Executors/LocalExecutor";
import {Executor} from "./Executors/Executor";
import {ReportGenerator} from "./Reporters/ReportGenerator";
import {JadeHtmlReportGenerator} from "./Reporters/JadeHtmlReportGenerator";

export class Turbulence {
    http:HttpClient;
    testPlans:Array<TestPlan>;
    executor:Executor;
    reportGenerator:ReportGenerator;

    constructor(http, executor, reportGenerator) {
        this.http = http;
        this.executor = executor;
        this.testPlans = [];
        this.reportGenerator = reportGenerator;
    };

    startUserSteps() {
        var testPlan = new TestPlan(this, this.http);
        this.testPlans.unshift(testPlan);
        return testPlan;
    }

    run() {
        var self = this;
        var promise = this.executor.run(this.testPlans);
        return {
            then: function (func) {
                return promise.then(func);
            },
            report: function () {
                var promise2 = promise.then(function (results) {
                    return self.reportGenerator.toReport(results);
                });

                return {
                    then: function (func) {
                        return promise2.then(func);
                    }
                };
            }
        };
    }

}
