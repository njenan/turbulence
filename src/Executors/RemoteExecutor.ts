import {Executor} from './Executor';
import {TestPlan} from '../TestPlan';
import {HttpClient} from '../Http/HttpClient';
import Q = require('q');
import {ReportGenerator} from '../Reporters/ReportGenerator';

// tslint:disable-next-line:no-var-requires
let unirest = require('unirest');

export class RemoteExecutor implements Executor {
    reporter: ReportGenerator;

    constructor(reporter) {
        this.reporter = reporter;
    }

    run(testPlans: Array<TestPlan>, http: HttpClient): Q.Promise<SummaryResults> {
        let deferred = Q.defer<SummaryResults>();

        unirest.post('http://localhost:7777')
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(JSON.stringify(testPlans))
            .end((resp) => {
                resp.body.requests.forEach((request) => {
                    this.reporter.addResult(request);
                });

                for (let i = 0; i < resp.body.errors; i++) {
                    this.reporter.addError();
                }

                deferred.resolve(null);
            });

        return deferred.promise;
    }
}
