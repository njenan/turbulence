import Q = require('q');

import {TestStep} from '../TestStep';
import {EmbeddableStepCreator} from '../EmbeddableStepCreator';
import {StepCreator} from '../StepCreator';
import {Parent} from '../../Parent';
import {ReportGenerator} from '../../Reporters/ReportGenerator';

// Must implement step creator and not extend embeddable step creator because otherwise a circular dependency will
// result
export class LoopStep<T> implements TestStep, StepCreator {

    parent: Parent<T>;
    reporter: ReportGenerator;
    times: number;
    creator: EmbeddableStepCreator;
    type: string = 'LoopStep';

    constructor(parent, reporter, times) {
        this.parent = new Parent(parent);
        this.reporter = reporter;
        this.times = times;
        this.creator = new EmbeddableStepCreator(reporter);
    }

    execute(http): Q.Promise<any> {
        let self = this;

        let chainPromiseNTimes = (i, initialPromise): Q.Promise<any> => {
            if (i === 0) {
                return initialPromise;
            } else {
                return chainPromiseNTimes(i - 1, self.creator.steps.reduce((promise, nextStep): Q.Promise<any> => {
                    return promise.then((data): Q.Promise<any> => {
                        return nextStep.execute(http, data);
                    });
                }, initialPromise));
            }
        };

        return chainPromiseNTimes(this.times, Q.resolve(null));
    }

    /**
     * End the loop and return the parent object.
     * @returns {T}
     */
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

    processor(func): StepCreator {
        this.creator.processor(func);
        return this;
    }

    expectStatus(code): StepCreator {
        this.creator.expectStatus(code);
        return this;
    }

}
