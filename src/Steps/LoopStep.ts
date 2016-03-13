/// <reference path="../../typings/q/Q.d.ts" />

import Q = require('q');

import {TestStep} from "./TestStep";
import {StepCreator} from "./StepCreator";
import {HttpGetStep} from "./HttpGetStep";
import {SummaryResults} from "../SummaryResults";
import {PauseStep} from "./PauseStep";
import {AssertStatusStep} from "./AssertStatusStep";
import {AssertStep} from "./AssertStep";
import {HttpClient} from "../HttpClient";

export class LoopStep<T> implements TestStep, StepCreator {

    parent:T;
    results:SummaryResults;
    steps:Array<TestStep>;
    times:number;
    http:HttpClient;

    constructor(parent, results, times) {
        this.parent = parent;
        this.http = parent.http;
        this.results = results;
        this.steps = [];
        this.times = times;
    }

    execute():Q.Promise<any> {
        var deferred = Q.defer();

        setTimeout(function () {
            deferred.resolve();
        }, 0);

        var self = this;

        var chainPromiseNTimes = function (i, promise):Q.Promise<any> {
            if (i === 0) {
                return promise;
            } else {
                return chainPromiseNTimes(i - 1, self.steps.reduce(function (promise, nextStep):Q.Promise<any> {
                    return promise.then(function (data):Q.Promise<any> {
                        return nextStep.execute(data);
                    });
                }, promise));
            }
        };

        return chainPromiseNTimes(this.times, deferred.promise);
    }

    addStep(step) {
        this.steps.push(step);
    }

    loop() {
        return this;
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

    endLoop():T {
        return this.parent;
    }

}
