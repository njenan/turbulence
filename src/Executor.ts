import {TestPlan} from "./TestPlan";
import {SummaryResults} from "./SummaryResults";

export interface Executor {

     run(tests:Array<TestPlan>):Q.Promise<SummaryResults>;
}