import {TestPlan} from './../TestPlan';
import {SummaryResults} from './../Results/SummaryResults';
import {HttpClient} from '../Http/HttpClient';

import Q = require('q');

export interface Executor {

    run(tests: Array<TestPlan>, http: HttpClient): Q.Promise<SummaryResults>;
}
