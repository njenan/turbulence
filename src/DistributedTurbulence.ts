import {LocalExecutor} from './Executors/LocalExecutor';
import {TestPlan} from './TestPlan';
import {UnirestHttpClient} from './Http/UnirestHttpClient';


export class DistributedTurbulence {
    executor = new LocalExecutor();

    route(request, reply) {
        let testPlans: Array<TestPlan> = request.payload.map((entry) => {
            return JSON.parse(JSON.stringify(entry), TestPlan.reviver);
        });

        this.executor.run(testPlans, new UnirestHttpClient()).then((report) => {
            reply(report);
        });
    }

}
