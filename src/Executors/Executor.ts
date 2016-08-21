import {TestPlan} from "./../TestPlan";
import {SummaryResults} from "./../Results/SummaryResults";
import {HttpClient} from "../Http/HttpClient";

export interface Executor {

    run(tests: Array<TestPlan>, http: HttpClient): Q.Promise<SummaryResults>;
}