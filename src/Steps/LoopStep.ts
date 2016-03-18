/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "./TestStep";
import {StepCreator} from "./StepCreator";
import {HttpGetStep} from "./HttpGetStep";
import {SummaryResults} from "../SummaryResults";
import {PauseStep} from "./PauseStep";
import {AssertStatusStep} from "./AssertStatusStep";
import {AssertHttpResponseStep} from "./AssertHttpResponseStep";
import {HttpClient} from "../HttpClient";
import {IStepCreator} from "./IStepCreator";

export class LoopStep<T> implements TestStep, IStepCreator {

    parent:T;
    results:SummaryResults;
    times:number;
    http:HttpClient;
    creator:StepCreator;

    constructor(parent, http, results, times) {
        this.parent = parent;
        this.http = http;
        this.results = results;
        this.times = times;
        this.creator = new StepCreator(http, results);
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
                return chainPromiseNTimes(i - 1, self.creator.steps.reduce(function (promise, nextStep):Q.Promise<any> {
                    return promise.then(function (data):Q.Promise<any> {
                        return nextStep.execute(data);
                    });
                }, promise));
            }
        };

        return chainPromiseNTimes(this.times, deferred.promise);
    }

    endLoop():T {
        return this.parent;
    }

    loop(times:number):IStepCreator {
        this.creator.loop(times);
        return this;
    }

    if(predicate):IStepCreator {
        this.creator.if(predicate);
        return this;
    }

    get(url:String):IStepCreator {
        this.creator.get(url);
        return this;
    }

    pause(time:number):IStepCreator {
        this.creator.pause(time);
        return this;
    }

    assertResponse(predicate):IStepCreator {
        this.creator.assertResponse(predicate);
        return this;
    }

    expectStatus(code):IStepCreator {
        this.creator.expectStatus(code);
        return this;
    }

}
