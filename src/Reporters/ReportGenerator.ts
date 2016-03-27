import {SummaryResults} from "./../Results/SummaryResults";

export interface ReportGenerator {

    toReport(results:SummaryResults):void;

}
