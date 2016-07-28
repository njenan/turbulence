/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestStep} from "./TestStep";

export class RandomPauseStep implements TestStep {

    lower:number;
    upper:number;

    constructor(lower:number, upper:number) {
        this.lower = lower;
        this.upper = upper;
    }

    execute() {
        return Q.resolve(null).delay(Math.random() * (this.upper - this.lower) + this.lower);
    }
}
