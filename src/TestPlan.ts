/// <reference path="../typings/main/ambient/q/index.d.ts" />
/// <reference path='./Steps/EmbeddableStepCreator.ts' />

import Q = require('q');

import {TestStep} from "./Steps/TestStep";
import {LoopStep} from "./Steps/LoopStep";
import {StepCreator} from "./Steps/EmbeddableStepCreator";
import {HttpGetStep} from "./Steps/HttpGetStep";
import {HttpClient} from "./Http/HttpClient";
import {Turbulence} from "./Turbulence";
import {AssertHttpResponseStep} from "./Steps/AssertHttpResponseStep";
import {SummaryResults} from "./Results/SummaryResults";
import {AssertStatusStep} from "./Steps/AssertStatusStep";
import {PauseStep} from "./Steps/PauseStep";
import {IfStep} from "./Steps/IfStep";

export class TestPlan extends StepCreator {
    parent:Turbulence;
    name:String;
    steps:Array<TestStep>;
    http:HttpClient;
    results:SummaryResults;

    constructor(parent, http, name?) {
        var results = new SummaryResults();

        super(http, results);

        this.parent = parent;
        this.name = name;
        this.steps = [];
        this.http = http;
        this.results = new SummaryResults();

    }

    endTest() {
        return this.parent;
    }

    run():Q.Promise<SummaryResults> {
        var self = this;
        var deferred = Q.defer();
        deferred.resolve();

        return this.steps.reduce(function (promise, nextStep) {
                return promise.then(function (data) {
                    return nextStep.execute(data);
                });
            }, deferred.promise)
            .then(function () {
                return self.results;
            });

    }

}
