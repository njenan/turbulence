/// <reference path="../typings/main/ambient/q/index.d.ts" />
/// <reference path='./Steps/EmbeddableStepCreator.ts' />

import Q = require("q");

import {TestStep} from "./Steps/TestStep";
import {EmbeddableStepCreator} from "./Steps/EmbeddableStepCreator";
import {HttpClient} from "./Http/HttpClient";
import {Turbulence} from "./Turbulence";
import {SummaryResults} from "./Results/SummaryResults";
import {Parent} from "./Parent";

export class TestPlan extends EmbeddableStepCreator {
    parent: Parent<Turbulence>;
    name: String;
    steps: Array<TestStep>;
    targetUsers: number = 1;
    warmUp: number = 1;
    time: number = -1;
    actualUsers: number = 0;
    startTime: number;

    constructor(parent, name?) {
        super(new SummaryResults());

        this.parent = {value: parent, enumerable: false};
        this.name = name;
        this.steps = [];
    }

    endUserSteps() {
        return this.parent.value;
    }

    concurrentUsers(users: number) {
        this.targetUsers = users;
        return this;
    }

    rampUpPeriod(seconds: number) {
        this.warmUp = seconds;
        return this;
    }

    duration(millis) {
        this.time = millis;
        return this;
    }

    running() {
        return Date.now() < this.startTime + this.time;
    }

    run(http: HttpClient): Q.Promise<SummaryResults> {
        let self = this;
        let promises = [];

        this.startTime = Date.now();

        let script = (promise) => {
            return this.steps.reduce((promise, nextStep) => {
                return promise.then((data) => {
                    return nextStep.execute(http, data);
                });
            }, promise).then(() => {
                if (this.running()) {
                    return script(promise);
                }
            });
        };

        let rampUpIncrement = this.warmUp / this.targetUsers;

        let startTestPlans = () => {
            let i = 0;
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
