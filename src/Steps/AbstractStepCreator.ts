import {StepCreator} from './StepCreator';
import {TestStep} from './TestStep';
import {SummaryResults} from '../Results/SummaryResults';
import {LoopStep} from './Conditionals/LoopStep';
import {IfStep} from './Conditionals/IfStep';
import {HttpGetStep} from './Http/HttpGetStep';
import {HttpPostStep} from './Http/HttpPostStep';
import {HttpPutStep} from './Http/HttpPutStep';
import {HttpHeadStep} from './Http/HttpHeadStep';
import {HttpDeleteStep} from './Http/HttpDeleteStep';
import {PauseStep} from './PauseStep';
import {RandomPauseStep} from './RandomPauseStep';
import {AssertHttpResponseStep} from './Assertions/AssertHttpResponseStep';
import {ProcessorStep} from './ProcessorStep';
import {AssertStatusStep} from './Assertions/AssertStatusStep';

export abstract class AbstractStepCreator implements StepCreator {
    steps: Array<TestStep>;

    constructor() {
        this.steps = [];
    }

    abstract getResults(): SummaryResults;

    loop(times: number): StepCreator {
        let loop = new LoopStep(this, this.getResults(), times);
        this.addStep(loop);
        return loop;
    }

    if(predicate): StepCreator {
        let ifStep = new IfStep(this, this.getResults(), predicate);
        this.addStep(ifStep);
        return ifStep;
    }

    get(url: string, headers?: any, label?: string): StepCreator {
        this.addStep(new HttpGetStep(this.getResults(), url, headers, label));
        return this;
    }

    post(url: string, body: any, headers?: any, label?: string): StepCreator {
        this.addStep(new HttpPostStep(this.getResults(), url, body, headers, label));
        return this;
    }

    put(url: string, body: any, headers?: any, label?: string): StepCreator {
        this.addStep(new HttpPutStep(this.getResults(), url, body, headers, label));
        return this;
    }

    head(url: string, headers?: string, label?: string): StepCreator {
        this.addStep(new HttpHeadStep(this.getResults(), url, headers, label));
        return this;
    }

    delete(url: string, headers?: string, label?: string): StepCreator {
        this.addStep(new HttpDeleteStep(this.getResults(), url, headers, label));
        return this;
    }

    pause(time: number): StepCreator {
        this.addStep(new PauseStep(time));
        return this;
    }

    randomPause(lower: number, upper: number): StepCreator {
        this.addStep(new RandomPauseStep(lower, upper));
        return this;
    }

    addStep(step: TestStep): void {
        this.steps.push(step);
    }

    assertResponse(predicate): StepCreator {
        this.addStep(new AssertHttpResponseStep(this.getResults(), predicate));
        return this;
    }

    processor(func): StepCreator {
        this.addStep(new ProcessorStep(func));
        return this;
    }

    expectStatus(code): StepCreator {
        this.addStep(new AssertStatusStep(this.getResults(), code));
        return this;
    }
}
