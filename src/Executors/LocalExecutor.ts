import Q = require('q');
import {TestPlan} from './../TestPlan';
import {SummaryResults} from './../Results/SummaryResults';
import {Executor} from './Executor';
import {HttpClient} from '../Http/HttpClient';
import {ReportGenerator} from '../Reporters/ReportGenerator';
import {ExecuteInSequence} from './ExecuteInSequence';

export class LocalExecutor implements Executor {
    reporter;

    constructor(reporter: ReportGenerator) {
        this.reporter = reporter;
    }

    run(testPlans: Array<TestPlan>, http: HttpClient): Q.Promise<SummaryResults> {
        return ExecuteInSequence(testPlans.map((testPlan) => {
            return () => {
                return testPlan.run(http, this.reporter);
            };
        })).then((allResults): SummaryResults => {
            return allResults.reduce((left, right) => {
                right.errors = right.errors + left.errors;
                return right;
            });
        });

    }
}
