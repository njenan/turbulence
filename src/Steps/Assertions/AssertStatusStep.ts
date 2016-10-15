import Q = require('q');

import {TestStep} from "../TestStep";
import {SummaryResults} from "../../Results/SummaryResults";
import {HttpResponse} from "../../Http/HttpResponse";
import {HttpClient} from "../../Http/HttpClient";

export class AssertStatusStep implements TestStep {

    results: SummaryResults;
    code: number;
    type: string = 'AssertStatusStep';

    constructor(results, code) {
        this.results = results;
        this.code = code;
    }

    execute(http: HttpClient, resp: HttpResponse): Q.Promise<HttpResponse> {
        if (resp.statusCode !== this.code) {
            this.results.errors++;
        }

        return Q.resolve(resp);
    }
}