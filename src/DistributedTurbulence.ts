import Q = require('q');
import {TestPlan} from './TestPlan';
import {ReportGenerator} from './Reporters/ReportGenerator';
import {Executor} from './Executors/Executor';
import {HttpClient} from './Http/HttpClient';

export class DistributedTurbulence {
    executor: Executor;
    reporter: ReportGenerator;
    http: HttpClient;
    state = Q.resolve(null);

    constructor(executor, reporter, http) {
        this.executor = executor;
        this.reporter = reporter;
        this.http = http;
    }

    route(request, reply) {
        let testPlans: Array<TestPlan> = request.payload.map((entry) => {
            return JSON.parse(JSON.stringify(entry), TestPlan.reviver(this.reporter));
        });

        this.state = this.state.then(() => {
            return this.executor.run(testPlans, this.http).then(() => {
                reply(this.reporter);
            });
        });
    }
}
