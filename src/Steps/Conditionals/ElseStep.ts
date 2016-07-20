/// <reference path="../../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "../TestStep";
import {EmbeddableStepCreator} from "../EmbeddableStepCreator";
import {SummaryResults} from "../../Results/SummaryResults";
import {IfStep} from "./IfStep";
import {StepCreator} from "../StepCreator";

//Must implement step creator and not extend embeddable step creator because otherwise a circular dependency will result
export class ElseStep implements TestStep, StepCreator {

    parent:IfStep;
    creator:EmbeddableStepCreator;
    results:SummaryResults;

    constructor(parent, http, results) {
        this.parent = parent;
        this.results = results;
        this.creator = new EmbeddableStepCreator(http, results);
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

    post(url:string, body:any):StepCreator {
        this.creator.post(url, body);
        return this;
    }

    put(url:string, body:any):StepCreator {
        this.creator.put(url, body);
        return this;
    }

    head(url:string):StepCreator {
        this.creator.head(url);
        return this;
    }

    delete(url:string):StepCreator {
        this.creator.delete(url);
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