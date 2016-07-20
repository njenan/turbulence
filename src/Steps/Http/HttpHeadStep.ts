import {AbstractHttpStep} from "./HttpStep";
import {HttpClient} from "../../Http/HttpClient";
import {TestStep} from "../TestStep";

export class HttpHeadStep extends AbstractHttpStep implements TestStep {

    http:HttpClient;
    url:string;

    constructor(parent, results, http, url, label) {
        super(parent, results, url, label);

        this.http = http;
        this.url = url;
    }

    makeCall() {
        return this.http.head(this.url);
    }

    getType() {
        return 'HEAD';
    }
}