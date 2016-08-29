import Q = require('q');
import {TestPlan} from './../TestPlan';
import {SummaryResults} from './../Results/SummaryResults';
import {Executor} from './Executor';
import {HttpClient} from '../Http/HttpClient';

export class LocalExecutor implements Executor {

    run(testPlans: Array<TestPlan>, http: HttpClient) {
        let allResults: SummaryResults[] = [];

        return testPlans.reduce(
            (promise: Q.Promise<SummaryResults>, nextTestPlan: TestPlan): Q.Promise<SummaryResults> => {
                return promise.then((): Q.Promise<SummaryResults> => {
                    let result = nextTestPlan.run(http);

                    return result.then((results) => {
                        allResults.push(results);
                        return results;
                    });
                });
            }, Q.resolve(null))
            .then((): SummaryResults => {
                return allResults.reduce((left, right) => {
                    right.errors = right.errors + left.errors;
                    return right;
                });
            });
    }
}
