import {AbstractHttpStep} from "./HttpStep";
import {HttpClient} from "../../Http/HttpClient";
import {TestStep} from "../TestStep";

export class HttpHeadStep extends AbstractHttpStep implements TestStep {

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
        return this.http.head(this.url, this.headers);
    }

    getType() {
        return 'HEAD';
    }
}