import {ReportGenerator} from '../ReportGenerator';

export class StubReportGenerator implements ReportGenerator {
    results = [];

    toReport = (results) => {
        this.results.push(results);
        return results;
    }
}
