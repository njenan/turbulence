import Q = require('q');

import {TestStep} from "../TestStep";
import {EmbeddableStepCreator} from "../EmbeddableStepCreator";
import {StepCreator} from "../StepCreator";
import {SummaryResults} from "../../Results/SummaryResults";
import {ElseStep} from "./ElseStep";
import {HttpClient} from "../../Http/HttpClient";
import {RandomPauseStep} from "../RandomPauseStep";
import {Parent} from "../../Parent";

//Must implement step creator and not extend embeddable step creator because otherwise a circular dependency will result
export class IfStep implements TestStep, StepCreator {

    parent: Parent<StepCreator>;
    predicate: (data) => boolean;
    predicateRaw: string;
    creator: EmbeddableStepCreator;
    results: SummaryResults;
    elseStep: ElseStep;
    type: string = 'IfStep';

    constructor(parent, results, predicate) {
        this.parent = new Parent(parent);
        this.results = results;
        this.predicate = predicate;
        this.predicateRaw = predicate.toString();
        this.creator = new EmbeddableStepCreator(results);
    }

    else() {
        this.elseStep = new ElseStep(this, this.results);
        return this.elseStep;
    }

    endIf() {
        return this.parent.value;
    }

    execute(http: HttpClient, data): Q.Promise<any> {
        var self = this;

        if (this.predicate(data)) {
            return this.creator.steps.reduce((promise, nextStep) => {
                return promise.then((data) => {
                    return nextStep.execute(http, data);
                });
            }, Q.resolve(null))
                .then(() => {
                    return self.results;
                });
        } else if (this.elseStep) {
            return this.elseStep.execute(http, data);
        }
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
