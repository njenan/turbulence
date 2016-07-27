import {EmbeddableStepCreator} from "../EmbeddableStepCreator";
import {SummaryResults} from "../../Results/SummaryResults";
import {HttpResponse} from "../../Http/HttpResponse";
import {HttpRequestRecord} from "./HttpRequestRecord";

export abstract class AbstractHttpStep {

    parent:EmbeddableStepCreator;
    results:SummaryResults;
    url:string;
    label:string;

    constructor(parent, results, url, label) {
        this.parent = parent;
        this.results = results;
        this.url = url;
        this.label = label;
    }

    abstract makeCall():Q.Promise<HttpResponse>;

    abstract getType():string;

    execute():Q.Promise<HttpResponse> {
        var self = this;
        var start = new Date().getTime();

        return this.makeCall().then((resp) => {
            var end = new Date().getTime();
            var duration = end - start;

            var requestRecord = new HttpRequestRecord(self, resp, duration, Date.now());
            self.results.requests.push(requestRecord);
            return resp;
        });
    }
}