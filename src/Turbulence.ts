import {HttpClient} from './Http/HttpClient';
import {TestPlan} from './TestPlan';
import {Executor} from './Executors/Executor';
import {ReportGenerator} from './Reporters/ReportGenerator';
import {Criteria} from './Criteria/Criteria';

/**
 * Turbulence is a variable automatically provided inside of Turbulence test plans.  It is the entry point for all
 * tests, and allows test plans to be defined.
 */
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

    /**
     * Start a new test.
     *
     * @returns {TestPlan}
     */
    startUserSteps() {
        let testPlan = new TestPlan(this, this.reportGenerator, this.http);
        this.testPlans.unshift(testPlan);
        return testPlan;
    }

    /**
     * @hidden
     * @returns {PromiseLike<void>}
     */
    run() {
        return this.executor.run(this.testPlans, this.http)
            .then((results) => {
                if (this.testPlans[0].breakerFunction) {
                    let criteria = new Criteria();
                    this.testPlans[0].breakerFunction(criteria);
                    criteria.validate(this.reportGenerator);
                }

                return results;
            })
            .then(this.reportGenerator.end.bind(this.reportGenerator));
    }
}
