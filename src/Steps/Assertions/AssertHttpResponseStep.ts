/// <reference path="../../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "../TestStep";
import {HttpResponse} from "../../Http/HttpResponse";
import {SummaryResults} from "../../Results/SummaryResults";
import {ExtractFunctionSignature} from "./BodyTransformer/ExtractFunctionSignature";
import {TransformerFactory} from "./BodyTransformer/TransformerFactory";
import {HttpClient} from "../../Http/HttpClient";

export class AssertHttpResponseStep implements TestStep {
    results: SummaryResults;
    validator: any;

    constructor(results, validator) {
        this.results = results;
        this.validator = validator;
    }

    execute(http: HttpClient, resp: HttpResponse): Q.Promise<HttpResponse> {
        var args = [];
        var signature = ExtractFunctionSignature(this.validator.toString());
        var promise = Q.resolve<any>(null);

        for (var k in signature) {
            var transformer = TransformerFactory(k);
            if (transformer) {
                //Function is here so that the loop doesn't overwrite the transformer, k variables
                ((transformer, k) => {
                    promise = promise.then(() => {
                        return transformer(resp);
                    }).then((arg) => {
                        args[signature[k]] = arg;
                    });
                })(transformer, k);
            }
        }

        promise = promise.then(()=> {
            var valid;

            try {
                valid = this.validator.apply(this, args)
            } catch (e) {
                valid = false;
            }

            if (!valid) {
                this.results.errors++;
            }
        }).catch((err) => {
            this.results.errors++;
        });


        return promise.then(() => {
            return resp
        });
    }
}
