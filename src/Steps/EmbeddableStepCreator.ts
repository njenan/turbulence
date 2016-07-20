/// <reference path="./ElseStep.ts" />
/// <reference path="./LoopStep.ts" />
/// <reference path="./IfStep.ts" />

import {TestStep} from "./TestStep";
import {HttpGetStep} from "./HttpGetStep";
import {HttpClient} from "../Http/HttpClient";
import {SummaryResults} from "../Results/SummaryResults";
import {PauseStep} from "./PauseStep";
import {AssertHttpResponseStep} from "./AssertHttpResponseStep";
import {AssertStatusStep} from "./AssertStatusStep";
import {StepCreator} from "./StepCreator";
import {HttpPostStep} from "./HttpPostStep";
import {IfStep} from "./IfStep";
import {LoopStep} from "./LoopStep";

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

    get(url:string, label?:string):StepCreator {
        this.addStep(new HttpGetStep(this, this.results, this.http, url, label));
        return this;
    }

    post(url:string, body:any, label?:string):StepCreator {
        this.addStep(new HttpPostStep(this, this.results, this.http, url, body, label));
        return this;
    }

    pause(time:number):StepCreator {
        this.addStep(new PauseStep(time));
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
