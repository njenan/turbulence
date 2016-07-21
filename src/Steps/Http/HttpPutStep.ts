import {TestStep} from "../TestStep";
import {AbstractHttpStep} from "./HttpStep";
import {HttpClient} from "../../Http/HttpClient";

export class HttpPutStep extends AbstractHttpStep implements TestStep {

    http:HttpClient;
    url:string;
    body:any;
    headers:any;

    constructor(parent, results, http, url, body, label) {
        super(parent, results, url, label);

        this.http = http;
        this.url = url;
        this.body = body;
    }

    makeCall() {
        return this.http.post(this.url, this.body);
    }

    getType() {
        return 'PUT';
    }
}