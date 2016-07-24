/// <reference path="../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

import {TestPlan} from "./../TestPlan";
import {SummaryResults} from "./../Results/SummaryResults";
import {Executor} from "./Executor";

export class LocalExecutor implements Executor {

    run(testPlans:Array<TestPlan>) {
        var deferred = Q.defer<SummaryResults>();
        deferred.resolve();

        var allResults:SummaryResults[] = [];

        return testPlans.reduce((promise:Q.Promise<SummaryResults>, nextTestPlan:TestPlan):Q.Promise<SummaryResults> => {
                return promise.then(():Q.Promise<SummaryResults> => {
                    var result = nextTestPlan.run();

                    return result.then((results) => {
                        allResults.push(results);
                        return results;
                    });
                });
            }, deferred.promise)
            .then(():SummaryResults => {
                return allResults.reduce((left, right) => {
                    right.errors = right.errors + left.errors;
                    return right;
                });
            });
    }
}