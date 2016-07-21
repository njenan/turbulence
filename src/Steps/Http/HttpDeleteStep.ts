import {TestStep} from "../TestStep";
import {AbstractHttpStep} from "./HttpStep";
import {HttpClient} from "../../Http/HttpClient";

export class HttpDeleteStep extends AbstractHttpStep implements TestStep {

    http:HttpClient;
    url:string;
    headers:string;

    constructor(parent, results, http, url, headers?, label?) {
        super(parent, results, url, label);

        this.http = http;
        this.url = url;
        this.headers = headers;
    }

    makeCall() {
        return this.http.delete(this.url, this.headers);
    }

    getType() {
        return 'DELETE';
    }
}