import {TestStep} from "../TestStep";
import {HttpResponse} from "../../Http/HttpResponse";
import {HttpClient} from "../../Http/HttpClient";
import {SummaryResults} from "../../Results/SummaryResults";
import {EmbeddableStepCreator} from "../EmbeddableStepCreator";
import {HttpRequestRecord} from "./HttpRequestRecord";
import {HttpStep} from "./HttpStep";

export class HttpGetStep implements TestStep, HttpStep {

    parent:EmbeddableStepCreator;
    url:string;
    http:HttpClient;
    results:SummaryResults;
    label:string;

    constructor(parent:EmbeddableStepCreator, results, http, url, label) {
        this.parent = parent;
        this.url = url;
        this.http = http;
        this.results = results;
        this.label = label;
    }

    execute():Q.Promise<HttpResponse> {
        var self = this;
        var start = new Date().getTime();

        return this.http.get(this.url).then(function (resp) {
            var end = new Date().getTime();
            var duration = end - start;

            var requestRecord = new HttpRequestRecord(self, resp, duration);
            self.results.requests.push(requestRecord);
            return resp;
        });
    }

    getType() {
        return 'GET';
    }
}