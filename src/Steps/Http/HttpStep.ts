import {EmbeddableStepCreator} from "../EmbeddableStepCreator";
import {SummaryResults} from "../../Results/SummaryResults";
import {HttpResponse} from "../../Http/HttpResponse";
import {HttpRequestRecord} from "./HttpRequestRecord";
import {Parent} from "../../Parent";

export abstract class AbstractHttpStep {
    results: SummaryResults;
    url: string;
    label: string;

    constructor(results, url, label) {
        this.results = results;
        this.url = url;
        this.label = label;
    }

    abstract makeCall(http): Q.Promise<HttpResponse>;

    abstract getType(): string;

    execute(http): Q.Promise<HttpResponse> {
        var self = this;
        var start = new Date().getTime();

        return this.makeCall(http).then((resp) => {
            var end = new Date().getTime();
            var duration = end - start;

            var requestRecord = new HttpRequestRecord(self, resp, duration, Date.now());
            self.results.requests.push(requestRecord);
            return resp;
        });
    }
}