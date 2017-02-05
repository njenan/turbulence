import {TestPlan} from './../TestPlan';
import {HttpClient} from '../Http/HttpClient';

import Q = require('q');

export interface Executor {

    run(tests: Array<TestPlan>, http: HttpClient): Q.Promise<Void>;
}
