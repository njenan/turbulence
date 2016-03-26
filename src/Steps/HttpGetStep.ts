import {TestStep} from "./TestStep";
import {HttpResponse} from "../Http/HttpResponse";
import {HttpClient} from "../Http/HttpClient";
import {SummaryResults} from "../Results/SummaryResults";
import {EmbeddableStepCreator} from "./EmbeddableStepCreator";
import {AssertHttpResponseStep} from "./AssertHttpResponseStep";
import {AssertStatusStep} from "./AssertStatusStep";

export class HttpGetStep implements TestStep {

    parent:EmbeddableStepCreator;
    url:string;
    http:HttpClient;
    results:SummaryResults;

    constructor(parent:EmbeddableStepCreator, results, http, url) {
        this.parent = parent;
        this.url = url;
        this.http = http;
        this.results = results;
    }

    execute():Q.Promise<HttpResponse> {
        var self = this;
        var start = new Date().getTime();

        return this.http.get(this.url).then(function (resp) {
            var end = new Date().getTime();
            var duration = end - start;

            self.results.requests.push({
                type: 'GET',
                url: self.url,
                status: resp.statusCode,
                error: false,
                duration: duration
            });
            return resp;
        });
    }
}