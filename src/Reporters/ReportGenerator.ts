import {HttpRequestRecord} from '../Steps/Http/HttpRequestRecord';

export interface ReportGenerator {

    /**
     * 
     * @param result
     */
    addResult(result: HttpRequestRecord): void;

    /**
     * Called when the test plan has finished.
     */
    end(): void;

}
