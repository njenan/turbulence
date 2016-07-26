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
    targetUsers:number = 1;
    warmUp:number = 1;
    time:number = -1;
    actualUsers:number = 0;
    startTime:number;

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
        this.targetUsers = users;
        return this;
    }

    rampUpPeriod(seconds:number) {
        this.warmUp = seconds;
        return this;
    }

    duration(millis) {
        this.time = millis;
        return this;
    }

    currentTargetUsers() {
        return this.targetUsers;
    }

    running() {
        return Date.now() < this.startTime + this.time;
    }

    run():Q.Promise<SummaryResults> {
        var self = this;
        var promises = [];

        this.startTime = Date.now();

        var script = (promise) => {
            return this.steps.reduce((promise, nextStep) => {
                return promise.then((data) => {
                    return nextStep.execute(data);
                });
            }, promise).then(() => {
                if (this.running()) {
                    return script(promise);
                }
            });
        };

        var rampUpIncrement = this.warmUp / this.targetUsers;

        var startTestPlans = () => {
            var i = 0;
            while (this.actualUsers < this.targetUsers) {
                promises.push(script(Q.resolve(null).delay(rampUpIncrement * i++)));
                this.actualUsers++;
            }
        };

        startTestPlans();

        return Q.all(promises).then(() => {
            return self.results;
        });
    }

}
