/// <reference path="../../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "../TestStep";
import {HttpResponse} from "../../Http/HttpResponse";
import {SummaryResults} from "../../Results/SummaryResults";

export class AssertHttpResponseStep implements TestStep {

    results:SummaryResults;
    validator:(resp:HttpResponse) => boolean;

    constructor(results, validator) {
        this.results = results;
        this.validator = validator;
    }

    execute(resp:HttpResponse):Q.Promise<HttpResponse> {
        if (!this.validator(resp)) {
            this.results.errors++;
        }

        return Q.resolve(resp);
    }
}