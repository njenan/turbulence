import {HttpResponse} from "./HttpResponse";
import {JourneyStep} from "./JourneyStep";
import {SummaryResults} from "./SummaryResults";

export class ExecutionState {
    resp;
    step;
    result;

    constructor(resp:HttpResponse, step:JourneyStep, result:SummaryResults) {
        this.resp = resp;
        this.step = step;
        this.result = result;
    }
}