import {TestStep} from "../TestStep";
import {HttpStep} from "./HttpStep";
import {HttpResponse} from "../../Http/HttpResponse";
import {EmbeddableStepCreator} from "../EmbeddableStepCreator";
import {HttpClient} from "../../Http/HttpClient";
import {SummaryResults} from "../../Results/SummaryResults";
import {HttpRequestRecord} from "./HttpRequestRecord";

export class HttpPostStep implements TestStep, HttpStep {

    parent:EmbeddableStepCreator;
    url:string;
    http:HttpClient;
    results:SummaryResults;
    label:string;
    body:any;

    constructor(parent:EmbeddableStepCreator, results, http, url, body, label) {
        this.parent = parent;
        this.results = results;
        this.http = http;
        this.url = url;
        this.body = body;
        this.label = label;
    }

    execute():Q.Promise<HttpResponse> {
        var self = this;
        var start = new Date().getTime();

        return this.http.post(this.url, this.body).then(function (resp) {
            var end = new Date().getTime();
            var duration = end - start;

            var requestRecord = new HttpRequestRecord(self, resp, duration);
            self.results.requests.push(requestRecord);
            return resp;
        });
    }

    getType() {
        return 'POST';
    }
}