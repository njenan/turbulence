import {TestStep} from "./TestStep";
import {HttpResponse} from "../HttpResponse";
import {HttpClient} from "../HttpClient";
import {SummaryResults} from "../SummaryResults";
import {StepCreator} from "./StepCreator";
import {AssertHttpResponseStep} from "./AssertHttpResponseStep";
import {AssertStatusStep} from "./AssertStatusStep";

export class HttpGetStep implements TestStep {

    parent:StepCreator;
    url:string;
    http:HttpClient;
    results:SummaryResults;

    constructor(parent:StepCreator, results, http, url) {
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