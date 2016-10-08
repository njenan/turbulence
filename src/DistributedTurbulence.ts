import Q = require('q');
import {TestPlan} from './TestPlan';

export class DistributedTurbulence {
    executor;
    http;
    state = Q.resolve(null);

    constructor(executor, http) {
        this.executor = executor;
        this.http = http;
    }

    route(request, reply) {
        let testPlans: Array<TestPlan> = request.payload.map((entry) => {
            return JSON.parse(JSON.stringify(entry), TestPlan.reviver);
        });

        this.state = this.state.then(() => {
            return this.executor.run(testPlans, this.http).then((report) => {
                reply(report);
            });
        });
    }
}
