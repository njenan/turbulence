/// <reference path="../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {HttpClient} from './HttpClient';
import {HttpResponse} from "./HttpResponse";
import {SummaryResults} from "./SummaryResults";
import {TestPlan} from "./TestPlan";
import {LocalExecutor} from "./LocalExecutor";
import {Executor} from "./Executor";

export class Turbulence {
    http:HttpClient;
    testPlans:Array<TestPlan>;
    executor:Executor;


    constructor(http, executor) {
        this.http = http;
        this.executor = executor;
        this.testPlans = [];
    };

    startTest() {
        var testPlan = new TestPlan(this, this.http);
        this.testPlans.unshift(testPlan);
        return testPlan;
    }

    run():Q.Promise<SummaryResults> {
        return this.executor.run(this.testPlans);
    }

}
