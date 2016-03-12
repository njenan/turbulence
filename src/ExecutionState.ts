import {HttpResponse} from "./HttpResponse";
import {HttpGetStep} from "./HttpGetStep";
import {SummaryResults} from "./SummaryResults";

export class ExecutionState {
    resp;
    step;
    result;

    constructor(resp:HttpResponse, step:HttpGetStep, result:SummaryResults) {
        this.resp = resp;
        this.step = step;
        this.result = result;
    }
}