import {ReportGenerator} from './ReportGenerator';
import {HttpRequestRecord} from '../Steps/Http/HttpRequestRecord';

export class JsonReportGenerator implements ReportGenerator {
    results = [];

    addResult(result: HttpRequestRecord): void {
        this.results.push(result);
    }

    end(): void {
        // tslint:disable-next-line:no-console
        console.log(JSON.stringify(this.results));
    }
}
