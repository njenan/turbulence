/// <reference path="../typings/main/ambient/q/index.d.ts" />
/// <reference path='./Steps/EmbeddableStepCreator.ts' />

import Q = require('q');

import {TestStep} from "./Steps/TestStep";
import {LoopStep} from "./Steps/Conditionals/LoopStep";
import {EmbeddableStepCreator} from "./Steps/EmbeddableStepCreator";
import {HttpGetStep} from "./Steps/Http/HttpGetStep";
import {HttpClient} from "./Http/HttpClient";
import {Turbulence} from "./Turbulence";
import {AssertHttpResponseStep} from "./Steps/Assertions/AssertHttpResponseStep";
import {SummaryResults} from "./Results/SummaryResults";
import {AssertStatusStep} from "./Steps/Assertions/AssertStatusStep";
import {PauseStep} from "./Steps/PauseStep";
import {IfStep} from "./Steps/Conditionals/IfStep";

export class TestPlan extends EmbeddableStepCreator {
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

    endUserSteps() {
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
