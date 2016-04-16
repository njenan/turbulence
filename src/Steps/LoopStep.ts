/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "./TestStep";
import {EmbeddableStepCreator} from "./EmbeddableStepCreator";
import {HttpGetStep} from "./HttpGetStep";
import {SummaryResults} from "../Results/SummaryResults";
import {PauseStep} from "./PauseStep";
import {AssertStatusStep} from "./AssertStatusStep";
import {AssertHttpResponseStep} from "./AssertHttpResponseStep";
import {HttpClient} from "../Http/HttpClient";
import {StepCreator} from "./StepCreator";

export class LoopStep<T> implements TestStep, StepCreator {

    parent:T;
    results:SummaryResults;
    times:number;
    http:HttpClient;
    creator:EmbeddableStepCreator;

    constructor(parent, http, results, times) {
        this.parent = parent;
        this.http = http;
        this.results = results;
        this.times = times;
        this.creator = new EmbeddableStepCreator(http, results);
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

    loop(times:number):StepCreator {
        this.creator.loop(times);
        return this;
    }

    if(predicate):StepCreator {
        this.creator.if(predicate);
        return this;
    }

    get(url:string):StepCreator {
        this.creator.get(url);
        return this;
    }

    pause(time:number):StepCreator {
        this.creator.pause(time);
        return this;
    }

    assertResponse(predicate):StepCreator {
        this.creator.assertResponse(predicate);
        return this;
    }

    expectStatus(code):StepCreator {
        this.creator.expectStatus(code);
        return this;
    }

}
