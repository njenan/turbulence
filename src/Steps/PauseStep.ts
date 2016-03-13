/// <reference path="../../typings/q/Q.d.ts" />

import Q = require('q');

import {TestStep} from "./TestStep";

export class PauseStep implements TestStep {

    time:number;

    constructor(time:number) {
        this.time = time;
    }

    execute() {
        var deferred = Q.defer<void>();

        setTimeout(function () {
            deferred.resolve();
        }, this.time);

        return deferred.promise;
    }
}
