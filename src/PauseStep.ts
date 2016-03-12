/// <reference path="../typings/q/Q.d.ts" />

import Q = require('q');

import {Step} from "./Step";


export class PauseStep implements Step {
    wait;

    constructor(milliseconds:Number) {
        this.wait = milliseconds;
    }

    execute() {
        var defer = Q.defer();

        setTimeout(function () {
            defer.resolve();
        }, this.wait);

        return defer.promise;
    }

}