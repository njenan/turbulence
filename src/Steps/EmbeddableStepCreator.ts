import {TestStep} from './TestStep';
import {HttpGetStep} from './Http/HttpGetStep';
import {PauseStep} from './PauseStep';
import {AssertHttpResponseStep} from './Assertions/AssertHttpResponseStep';
import {AssertStatusStep} from './Assertions/AssertStatusStep';
import {StepCreator} from './StepCreator';
import {HttpPostStep} from './Http/HttpPostStep';
import {IfStep} from './Conditionals/IfStep';
import {LoopStep} from './Conditionals/LoopStep';
import {HttpPutStep} from './Http/HttpPutStep';
import {HttpHeadStep} from './Http/HttpHeadStep';
import {HttpDeleteStep} from './Http/HttpDeleteStep';
import {RandomPauseStep} from './RandomPauseStep';
import {ProcessorStep} from './ProcessorStep';
import {ReportGenerator} from '../Reporters/ReportGenerator';

export class EmbeddableStepCreator implements StepCreator {
    steps: Array<TestStep>;
    reporter: ReportGenerator;

    constructor(reporter) {
        this.reporter = reporter;
        this.steps = [];
    }

    loop(times: number): LoopStep<{}> {
        let loop = new LoopStep(this, this.reporter, times);
        this.addStep(loop);
        return loop;
    }

    if(predicate): IfStep {
        let ifStep = new IfStep(this, this.reporter, predicate);
        this.addStep(ifStep);
        return ifStep;
    }

    get(url: string, headers?: any, label?: string): StepCreator {
        this.addStep(new HttpGetStep(this.reporter, url, headers, label));
        return this;
    }

    post(url: string, body: any, headers?: any, label?: string): StepCreator {
        this.addStep(new HttpPostStep(this.reporter, url, body, headers, label));
        return this;
    }

    put(url: string, body: any, headers?: any, label?: string): StepCreator {
        this.addStep(new HttpPutStep(this.reporter, url, body, headers, label));
        return this;
    }

    head(url: string, headers?: string, label?: string): StepCreator {
        this.addStep(new HttpHeadStep(this.reporter, url, headers, label));
        return this;
    }

    delete(url: string, headers?: string, label?: string): StepCreator {
        this.addStep(new HttpDeleteStep(this.reporter, url, headers, label));
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

    /**
     * @hidden
     * @param step
     */
    addStep(step: TestStep): void {
        this.steps.push(step);
    }

    assertResponse(predicate): StepCreator {
        this.addStep(new AssertHttpResponseStep(this.reporter, predicate));
        return this;
    }

    processor(func): StepCreator {
        this.addStep(new ProcessorStep(func));
        return this;
    }

    expectStatus(code): StepCreator {
        this.addStep(new AssertStatusStep(this.reporter, code));
        return this;
    }
}
