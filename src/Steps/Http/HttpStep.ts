import {SummaryResults} from '../../Results/SummaryResults';
import {HttpResponse} from '../../Http/HttpResponse';
import {HttpRequestRecord} from './HttpRequestRecord';
import Q = require('q');
import {ReportGenerator} from '../../Reporters/ReportGenerator';

export abstract class AbstractHttpStep {
    results: SummaryResults;
    reporter: ReportGenerator;
    url: string;
    label: string;

    constructor(results, reporter, url, label) {
        this.results = results;
        this.reporter = reporter;
        this.url = url;
        this.label = label;
    }

    abstract makeCall(http): Q.Promise<HttpResponse>;

    abstract getType(): string;

    execute(http): Q.Promise<HttpResponse> {
        let self = this;
        let start = new Date().getTime();

        return this.makeCall(http).then((resp) => {
            let end = new Date().getTime();
            let duration = end - start;

            let requestRecord = new HttpRequestRecord(self, resp, duration, Date.now());
            self.results.requests.push(requestRecord);
            self.reporter.addResult(requestRecord);
            return resp;
        });
    }
}
