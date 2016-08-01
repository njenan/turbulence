/// <reference path="../../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "../TestStep";
import {HttpResponse} from "../../Http/HttpResponse";
import {SummaryResults} from "../../Results/SummaryResults";
import {ExtractFunctionSignature} from "./BodyTransformer/ExtractFunctionSignature";
import {XmlBodyTransformer} from "./BodyTransformer/XmlBodyTransformer";
import {JsonBodyTransformer} from "./BodyTransformer/JsonBodyTransformer";

//No typings exist for jsonpath-plus TODO write them
var jsonpath = require('jsonpath-plus');

export class AssertHttpResponseStep implements TestStep {
    results:SummaryResults;
    validator:any;

    constructor(results, validator) {
        this.results = results;
        this.validator = validator;
    }

    execute(resp:HttpResponse):Q.Promise<HttpResponse> {
        var args = [];
        var signature = ExtractFunctionSignature(this.validator.toString());
        var promise = Q.resolve<any>(null);

        if (signature.Response != null) {
            args[signature.Response] = resp;
        }

        if (signature.JsonBody != null) {
            promise = promise.then(() => {
                return JsonBodyTransformer(resp);
            }).then((jsonBody) => {
                args[signature.JsonBody] = jsonBody;
            });
        }

        if (signature.XmlBody != null) {
            promise = promise.then(() => {
                return XmlBodyTransformer(resp);
            }).then((xmlBody) => {
                args[signature.XmlBody] = xmlBody;
            });
        }

        if (signature.JsonPath != null) {
            promise = promise.then(() => {
                return JsonBodyTransformer(resp);
            }).then((jsonBody) => {
                var JsonPath = (path) => {
                    return jsonpath({path: path, json: jsonBody});
                };

                args[signature.JsonPath] = JsonPath;
            });
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
