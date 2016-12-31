import Q = require('q');

import {TestStep} from '../TestStep';
import {EmbeddableStepCreator} from '../EmbeddableStepCreator';
import {SummaryResults} from '../../Results/SummaryResults';
import {StepCreator} from '../StepCreator';
import {Parent} from '../../Parent';

// Must implement step creator and not extend embeddable step creator because otherwise a circular dependency will
// result
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

    /**
     * Interal command used by Turbulence.  DO NOT USE.
     * @param http
     * @returns {Q.Promise<any>}
     */
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
    
    /**
     * Start a loop for the specified number of times.  Steps can be chained off of this object until
     * [[LoopStep.endLoop]] is called.
     *
     * @param times
     * @returns {LoopStep}
     */
    loop(times: number): StepCreator {
        this.creator.loop(times);
        return this;
    }

    /**
     * Start an if statement.  A predicate that resolves to either true or false should be provided.  If the predicate
     * resolves to true, the chained steps will be executed.  Otherwise only steps after the [[IfStep.endIf]] will be immediately executed.
     * @param predicate
     * @returns {LoopStep}
     */
    if(predicate): StepCreator {
        this.creator.if(predicate);
        return this;
    }

    /**
     * Send an Http Get request to the specified url.
     * @param url
     * @returns {LoopStep}
     */
    get(url: string): StepCreator {
        this.creator.get(url);
        return this;
    }

    /**
     * Send an Http Post request to the specified url with the provided body.
     * @param url
     * @param body
     * @returns {LoopStep}
     */
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
