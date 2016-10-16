import {ReportGenerator} from "../ReportGenerator";

export class StubReportGenerator implements ReportGenerator {
    results;

    toReport = (results) => {
        this.results = results;
        return results;
    }
}
