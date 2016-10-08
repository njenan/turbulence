import {ReportGenerator} from './ReportGenerator';

export class JsonReportGenerator implements ReportGenerator {

    toReport(results) {
        // tslint:disable-next-line:no-console
        console.log(JSON.stringify(results));
    }
}
