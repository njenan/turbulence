/// <reference path="./Conditionals/ElseStep.ts" />
/// <reference path="./Conditionals/LoopStep.ts" />
/// <reference path="./Conditionals/IfStep.ts" />

import {TestStep} from "./TestStep";
import {HttpGetStep} from "./Http/HttpGetStep";
import {HttpClient} from "../Http/HttpClient";
import {SummaryResults} from "../Results/SummaryResults";
import {PauseStep} from "./PauseStep";
import {AssertHttpResponseStep} from "./Assertions/AssertHttpResponseStep";
import {AssertStatusStep} from "./Assertions/AssertStatusStep";
import {StepCreator} from "./StepCreator";
import {HttpPostStep} from "./Http/HttpPostStep";
import {IfStep} from "./Conditionals/IfStep";
import {LoopStep} from "./Conditionals/LoopStep";
import {HttpPutStep} from "./Http/HttpPutStep";
import {HttpHeadStep} from "./Http/HttpHeadStep";
import {HttpDeleteStep} from "./Http/HttpDeleteStep";
import {RandomPauseStep} from "./RandomPauseStep";

export class EmbeddableStepCreator implements StepCreator {

    http:HttpClient;
    results:SummaryResults;
    steps:Array<TestStep>;

    constructor(http, results) {
        this.http = http;
        this.results = results;
        this.steps = [];
    }

    loop(times:number):StepCreator {
        var loop = new LoopStep(this, this.http, this.results, times);
        this.addStep(loop);
        return loop;
    }

    if(predicate):StepCreator {
        var ifStep = new IfStep(this, this.http, this.results, predicate);
        this.addStep(ifStep);
        return ifStep;
    }

    get(url:string, headers?:any, label?:string):StepCreator {
        this.addStep(new HttpGetStep(this, this.results, this.http, url, headers, label));
        return this;
    }

    post(url:string, body:any, headers?:any, label?:string):StepCreator {
        this.addStep(new HttpPostStep(this, this.results, this.http, url, body, headers, label));
        return this;
    }

    put(url:string, body:any, headers?:any, label?:string):StepCreator {
        this.addStep(new HttpPutStep(this, this.results, this.http, url, body, headers, label));
        return this;
    }

    head(url:string, headers?:string, label?:string):StepCreator {
        this.addStep(new HttpHeadStep(this, this.results, this.http, url, headers, label));
        return this;
    }

    delete(url:string, headers?:string, label?:string):StepCreator {
        this.addStep(new HttpDeleteStep(this, this.results, this.http, url, headers, label));
        return this;
    }

    pause(time:number):StepCreator {
        this.addStep(new PauseStep(time));
        return this;
    }

    randomPause(lower:number, upper:number):StepCreator {
        this.addStep(new RandomPauseStep(lower, upper));
        return this;
    }

    addStep(step:TestStep):void {
        this.steps.push(step);
    }

    assertResponse(predicate):StepCreator {
        this.addStep(new AssertHttpResponseStep(this.results, predicate));
        return this;
    }

    expectStatus(code):StepCreator {
        this.addStep(new AssertStatusStep(this.results, code));
        return this;
    }
}
