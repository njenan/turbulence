/// <reference path="../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "./Steps/TestStep";
import {LoopStep} from "./Steps/LoopStep";
import {StepCreator} from "./Steps/StepCreator";
import {HttpGetStep} from "./Steps/HttpGetStep";
import {HttpClient} from "./HttpClient";
import {Turbulence} from "./Turbulence";
import {AssertStep} from "./Steps/AssertStep";
import {SummaryResults} from "./SummaryResults";
import {AssertStatusStep} from "./Steps/AssertStatusStep";
import {PauseStep} from "./Steps/PauseStep";

export class TestPlan implements StepCreator {
    parent:Turbulence;
    name:String;
    steps:Array<TestStep>;
    http:HttpClient;
    results:SummaryResults;

    constructor(parent, http, name?) {
        this.parent = parent;
        this.name = name;
        this.steps = [];
        this.http = http;
        this.results = new SummaryResults();
    }

    addStep(step:TestStep) {
        this.steps.push(step);
    }

    loop(times:number) {
        var loop = new LoopStep(this, this.results, times);
        this.steps.push(loop);
        return loop;
    }

    get(url) {
        this.steps.push(new HttpGetStep(this, this.results, this.http, url));
        return this;
    }

    assertResponse(predicate) {
        this.steps.push(new AssertStep(this.results, predicate));
        return this;
    }

    expectStatus(code) {
        this.steps.push(new AssertStatusStep(this.results, code));
        return this;
    }

    pause(time) {
        this.steps.push(new PauseStep(time));
        return this;
    }

    endTest() {
        return this.parent;
    }

    run():Q.Promise<SummaryResults> {
        var self = this;
        var deferred = Q.defer();
        deferred.resolve();

        return this.steps.reduce(function (promise, nextStep) {
                return promise.then(function (data) {
                    return nextStep.execute(data);
                });
            }, deferred.promise)
            .then(function () {
                return self.results;
            });

    }

}
