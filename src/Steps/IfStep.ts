/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "./TestStep";
import {StepCreator} from "./StepCreator";
import {IStepCreator} from "./IStepCreator";
import {SummaryResults} from "../SummaryResults";

export class IfStep implements TestStep, IStepCreator {

    parent:IStepCreator;
    predicate:(data) => boolean;
    creator:StepCreator;
    results:SummaryResults;

    constructor(parent, http, results, predicate) {
        this.parent = parent;
        this.results = results;
        this.predicate = predicate;
        this.creator = new StepCreator(http, results);
    }

    then() {
        return this;
    }

    endIf() {
        return this.parent;
    }

    execute(data):Q.Promise<any> {
        var self = this;
        var deferred = Q.defer();
        deferred.resolve();

        if (this.predicate(data)) {
            console.log('predicate resolved to true, executing then steps');
            return this.creator.steps.reduce(function (promise, nextStep) {
                    return promise.then(function (data) {
                        return nextStep.execute(data);
                    });
                }, deferred.promise)
                .then(function () {
                    return self.results;
                });
        } else {
            console.log('predicate resolved to false, returning immediately');
            return deferred.promise;
        }
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
