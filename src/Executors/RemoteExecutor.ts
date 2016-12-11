import {Executor} from './Executor';
import {TestPlan} from '../TestPlan';
import {HttpClient} from '../Http/HttpClient';
import {SummaryResults} from '../Results/SummaryResults';
import Q = require('q');

// tslint:disable-next-line:no-var-requires
let unirest = require('unirest');

export class RemoteExecutor implements Executor {

    run(testPlans: Array<TestPlan>, http: HttpClient): Q.Promise<SummaryResults> {
        let deferred = Q.defer<SummaryResults>();

        unirest.post('http://localhost:7777')
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(JSON.stringify(testPlans))
            .end((resp) => {
                // TODO implement support for multiple test plans better
                let results = new SummaryResults(testPlans.pop().breakerFunction);
                results.requests = resp.body.requests;
                results.errors = resp.body.errors;
                deferred.resolve(results);
            });

        return deferred.promise;
    }
}
