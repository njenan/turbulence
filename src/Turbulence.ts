import {HttpClient} from './Http/HttpClient';
import {TestPlan} from './TestPlan';
import {Executor} from './Executors/Executor';
import {ReportGenerator} from './Reporters/ReportGenerator';
import {Criteria} from './Criteria/Criteria';

export class Turbulence {
    private http: HttpClient;
    private testPlans: Array<TestPlan>;
    private executor: Executor;
    private reportGenerator: ReportGenerator;

    constructor(http, executor, reportGenerator) {
        this.http = http;
        this.executor = executor;
        this.testPlans = [];
        this.reportGenerator = reportGenerator;
    };

    startUserSteps() {
        let testPlan = new TestPlan(this, this.http);
        this.testPlans.unshift(testPlan);
        return testPlan;
    }

    run() {
        return this.executor.run(this.testPlans, this.http)
            .then((results) => {
                if (this.testPlans[0].breakerFunction) {
                    let criteria = new Criteria();
                    this.testPlans[0].breakerFunction(criteria);
                    criteria.validate(results);
                }

                return results;
            })
            .then(this.reportGenerator.toReport);
    }
}
