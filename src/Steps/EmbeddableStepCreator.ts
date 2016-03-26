import {HttpResponse} from "../Http/HttpResponse";
import {TestStep} from "./TestStep";
import {HttpGetStep} from "./HttpGetStep";
import {HttpClient} from "../Http/HttpClient";
import {LoopStep} from "./LoopStep";
import {SummaryResults} from "../Results/SummaryResults";
import {IfStep} from "./IfStep";
import {PauseStep} from "./PauseStep";
import {AssertHttpResponseStep} from "./AssertHttpResponseStep";
import {AssertStatusStep} from "./AssertStatusStep";
import {IStepCreator} from "./StepCreator";

export class StepCreator implements IStepCreator {

    http:HttpClient;
    results:SummaryResults;
    steps:Array<TestStep>;

    constructor(http, results) {
        this.http = http;
        this.results = results;
        this.steps = [];
    }

    loop(times:number):IStepCreator {
        var loop = new LoopStep(this, this.http, this.results, times);
        this.addStep(loop);
        return loop;
    }

    if(predicate):IStepCreator {
        var ifStep = new IfStep(this, this.http, this.results, predicate);
        this.addStep(ifStep);
        return ifStep;
    }

    get(url:String):IStepCreator {
        this.addStep(new HttpGetStep(this, this.results, this.http, url));
        return this;
    }

    pause(time:number):IStepCreator {
        this.addStep(new PauseStep(time));
        return this;
    }

    addStep(step:TestStep):void {
        this.steps.push(step);
    }

    assertResponse(predicate):IStepCreator {
        this.addStep(new AssertHttpResponseStep(this.results, predicate));
        return this;
    }

    expectStatus(code):IStepCreator {
        this.addStep(new AssertStatusStep(this.results, code));
        return this;
    }
}
