import {TestPlan} from './TestPlan';

export class DistributedTurbulence {
    executor;
    http;

    constructor(executor, http) {
        this.executor = executor;
        this.http = http;
    }

    route(request, reply) {
        let testPlans: Array<TestPlan> = request.payload.map((entry) => {
            return JSON.parse(JSON.stringify(entry), TestPlan.reviver);
        });

        this.executor.run(testPlans, this.http).then((report) => {
            reply(report);
        });
    }
}
