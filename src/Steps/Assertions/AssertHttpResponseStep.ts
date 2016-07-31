/// <reference path="../../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "../TestStep";
import {HttpResponse} from "../../Http/HttpResponse";
import {SummaryResults} from "../../Results/SummaryResults";
import {BodyTypeDeterminator} from "./BodyType/BodyTypeDeterminator";
import {BodyTransformerFactory} from "./BodyTransformer/BodyTransformerFactory";

export class AssertHttpResponseStep implements TestStep {

    results:SummaryResults;
    validator:(resp:any) => boolean;

    constructor(results, validator) {
        this.results = results;
        this.validator = validator;
    }

    execute(resp:HttpResponse):Q.Promise<HttpResponse> {
        var bodyType = BodyTypeDeterminator(this.validator.toString());
        var transformer = BodyTransformerFactory(bodyType);

        if (!this.validator(transformer(resp))) {
            this.results.errors++;
        }

        return Q.resolve(resp);
    }
}