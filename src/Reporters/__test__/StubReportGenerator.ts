import {ReportGenerator} from '../ReportGenerator';
import {HttpRequestRecord} from '../../Steps/Http/HttpRequestRecord';

export class StubReportGenerator implements ReportGenerator {
    results = [];
    metrics = [];
    errors = 0;

    addResult(result: HttpRequestRecord): void {
        this.results.push(result);
    }

    addMetric(metric): void {
        this.metrics.push(metric);
    }

    addError() {
        this.errors++;
    }

    averageResponseTime(): number {
        return this.results.reduce((duration, request) => {
            return duration + (request.duration / this.results.length);
        }, 0);
    }

    end(): void {
        return null;
    }
}
