import {ReportGenerator} from '../ReportGenerator';
import {HttpRequestRecord} from '../../Steps/Http/HttpRequestRecord';

export class StubReportGenerator implements ReportGenerator {
    results = [];

    addResult(result: HttpRequestRecord): void {
        this.results.push(result);
    }

    end(): void {
        return null;
    }
}
