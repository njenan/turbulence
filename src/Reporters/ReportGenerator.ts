import {HttpRequestRecord} from '../Steps/Http/HttpRequestRecord';

export interface ReportGenerator {

    /**
     *
     * @param result
     */
    addResult(result: HttpRequestRecord): void;

    /**
     *
     * @param metric
     */
    addMetric(metric): void;

    /**
     * Increment error counter
     */
    addError(): void;

    /**
     * Called when the test plan has finished.
     */
    end(): void;

    /**
     *
     */
    averageResponseTime(): number;

}
