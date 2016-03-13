/// <reference path="../../typings/q/Q.d.ts" />

import Q = require('q');

import {TestStep} from "./TestStep";
import {SummaryResults} from "../SummaryResults";
import {HttpResponse} from "../HttpResponse";

export class AssertStatusStep implements TestStep {

    results:SummaryResults;
    code:number;

    constructor(results, code) {
        this.results = results;
        this.code = code;
    }

    execute(resp:HttpResponse):Q.Promise<HttpResponse> {
        var deferred = Q.defer<HttpResponse>();

        if (resp.statusCode !== this.code) {
            this.results.errors++;
        }

        deferred.resolve(resp);

        return deferred.promise;
    }
}