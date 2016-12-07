import Q = require('q');
import {SummaryResults} from '../Results/SummaryResults';

export function ExecuteInSequence<T>(executables: (() => Q.Promise<T>)[]): Q.Promise<T[]> {
    let allResults: T[] = <T[]> [];

    return executables.reduce(
        (promise: Q.Promise<SummaryResults>, nextTestPlan: () => Q.Promise<T>): Q.Promise<T> => {
            return promise.then((): Q.Promise<T> => {
                let result = nextTestPlan();

                return result.then((results) => {
                    allResults.push(results);
                    return results;
                });
            });
        }, Q.resolve(null))
        .then(() => {
            return allResults;
        });
}
