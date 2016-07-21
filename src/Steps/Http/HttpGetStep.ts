import {TestStep} from "../TestStep";
import {AbstractHttpStep} from "./HttpStep";
import {HttpClient} from "../../Http/HttpClient";

export class HttpGetStep extends AbstractHttpStep implements TestStep {

    http:HttpClient;
    url:string;
    headers:any;

    constructor(parent, results, http, url, headers?, label?) {
        super(parent, results, url, label);

        this.http = http;
        this.url = url;
        this.headers = headers;
    }

    makeCall() {
        return this.http.get(this.url, this.headers);
    }

    getType() {
        return 'GET';
    }
}