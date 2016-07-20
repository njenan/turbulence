/// <reference path="../../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "../TestStep";
import {EmbeddableStepCreator} from "../EmbeddableStepCreator";
import {StepCreator} from "../StepCreator";
import {SummaryResults} from "../../Results/SummaryResults";
import {ElseStep} from "./ElseStep";
import {HttpClient} from "../../Http/HttpClient";

//Must implement step creator and not extend embeddable step creator because otherwise a circular dependency will result
export class IfStep implements TestStep, StepCreator {

    parent:StepCreator;
    predicate:(data) => boolean;
    creator:EmbeddableStepCreator;
    results:SummaryResults;
    http:HttpClient;
    elseStep:ElseStep;

    constructor(parent, http, results, predicate) {
        this.parent = parent;
        this.http = http;
        this.results = results;
        this.predicate = predicate;
        this.creator = new EmbeddableStepCreator(http, results);
    }

    else() {
        this.elseStep = new ElseStep(this, this.http, this.results);
        return this.elseStep;
    }

    endIf() {
        return this.parent;
    }

    execute(data):Q.Promise<any> {
        var self = this;
        var deferred = Q.defer();
        deferred.resolve();

        if (this.predicate(data)) {
            return this.creator.steps.reduce(function (promise, nextStep) {
                return promise.then(function (data) {
                    return nextStep.execute(data);
                });
            }, deferred.promise)
                .then(function () {
                    return self.results;
                });
        } else if (this.elseStep) {
            return this.elseStep.execute(data);
        }
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
