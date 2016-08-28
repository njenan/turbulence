/// <reference path="../../../typings/main/ambient/q/index.d.ts" />
/// <reference path="../EmbeddableStepCreator.ts" />

import Q = require('q');

import {TestStep} from "../TestStep";
import {EmbeddableStepCreator} from "../EmbeddableStepCreator";
import {SummaryResults} from "../../Results/SummaryResults";
import {HttpClient} from "../../Http/HttpClient";
import {StepCreator} from "../StepCreator";
import {RandomPauseStep} from "../RandomPauseStep";
import {Parent} from "../../Parent";

//Must implement step creator and not extend embeddable step creator because otherwise a circular dependency will result
export class LoopStep<T> implements TestStep, StepCreator {

    parent: Parent<T>;
    results: SummaryResults;
    times: number;
    creator: EmbeddableStepCreator;
    type: string = 'LoopStep';

    constructor(parent, results, times) {
        this.parent = new Parent(parent);
        this.results = results;
        this.times = times;
        this.creator = new EmbeddableStepCreator(results);
    }

    execute(http): Q.Promise<any> {
        var self = this;

        var chainPromiseNTimes = (i, promise): Q.Promise<any> => {
            if (i === 0) {
                return promise;
            } else {
                return chainPromiseNTimes(i - 1, self.creator.steps.reduce((promise, nextStep): Q.Promise<any> => {
                    return promise.then((data): Q.Promise<any> => {
                        return nextStep.execute(http, data);
                    });
                }, promise));
            }
        };

        return chainPromiseNTimes(this.times, Q.resolve(null));
    }

    endLoop(): T {
        return this.parent.value;
    }

    loop(times: number): StepCreator {
        this.creator.loop(times);
        return this;
    }

    if(predicate): StepCreator {
        this.creator.if(predicate);
        return this;
    }

    get(url: string): StepCreator {
        this.creator.get(url);
        return this;
    }

    post(url: string, body: any): StepCreator {
        this.creator.post(url, body);
        return this;
    }

    put(url: string, body: any): StepCreator {
        this.creator.put(url, body);
        return this;
    }

    head(url: string): StepCreator {
        this.creator.head(url);
        return this;
    }

    delete(url: string): StepCreator {
        this.creator.delete(url);
        return this;
    }

    pause(time: number): StepCreator {
        this.creator.pause(time);
        return this;
    }

    randomPause(lower: number, upper: number): StepCreator {
        this.creator.randomPause(lower, upper);
        return this;
    }

    assertResponse(predicate): StepCreator {
        this.creator.assertResponse(predicate);
        return this;
    }

    expectStatus(code): StepCreator {
        this.creator.expectStatus(code);
        return this;
    }

}
