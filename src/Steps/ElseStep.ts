/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "./TestStep";
import {IStepCreator} from "./StepCreator";
import {StepCreator} from "./EmbeddableStepCreator";
import {SummaryResults} from "../Results/SummaryResults";
import {IfStep} from "./IfStep";

export class ElseStep implements TestStep, IStepCreator {

    parent:IfStep;
    creator:StepCreator;
    results:SummaryResults;

    constructor(parent, http, results) {
        this.parent = parent;
        this.results = results;
        this.creator = new StepCreator(http, results);
    }

    endIf() {
        return this.parent.endIf();
    }

    execute(data):Q.Promise<any> {
        var self = this;
        var deferred = Q.defer();
        deferred.resolve();

        return this.creator.steps.reduce(function (promise, nextStep) {
                return promise.then(function (data) {
                    return nextStep.execute(data);
                });
            }, deferred.promise)
            .then(function () {
                return self.results;
            });
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