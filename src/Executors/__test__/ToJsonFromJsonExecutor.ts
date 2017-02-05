import {TestPlan} from './../../TestPlan';
import {Executor} from './../Executor';
import {HttpClient} from '../../Http/HttpClient';
import {LocalExecutor} from '../LocalExecutor';
import {ReportGenerator} from '../../Reporters/ReportGenerator';

// Test executor to test that json serialization/deserialization works correctly
export class ToJsonFromJsonExecutor implements Executor {
    executor: Executor;
    reporter: ReportGenerator;

    constructor(reporter: ReportGenerator) {
        this.executor = new LocalExecutor(reporter);
        this.reporter = reporter;
    }

    run(testPlans: Array<TestPlan>, http: HttpClient) {
        return this.executor.run(testPlans.map((plan) => {
            return JSON.stringify(plan);
        }).map((plan) => {
            return JSON.parse(plan, TestPlan.reviver(this.reporter));
        }), http);
    }
}
