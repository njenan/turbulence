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
    users:number = 1;

    constructor(parent, http, name?) {
        super(http, new SummaryResults());

        this.parent = parent;
        this.name = name;
        this.steps = [];
        this.http = http;
    }

    endUserSteps() {
        return this.parent;
    }

    concurrentUsers(users:number) {
        this.users = users;
        return this;
    }

    run():Q.Promise<SummaryResults> {
        var self = this;
        var promises = [];

        for (var i = 0; i < this.users; i++) {
            promises.push(this.steps.reduce((promise, nextStep) => {
                return promise.then((data) => {
                    return nextStep.execute(data);
                });
            }, Q.resolve(null)));
        }

        return Q.all(promises).then(() => {
            return self.results;
        });
    }

}
