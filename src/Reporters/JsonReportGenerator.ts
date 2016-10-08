import {ReportGenerator} from "./ReportGenerator";

export class JsonReportGenerator implements ReportGenerator {

    toReport(results) {
        console.log(JSON.stringify(results));
    }
}
