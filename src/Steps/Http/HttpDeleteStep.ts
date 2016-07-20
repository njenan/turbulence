import {TestStep} from "../TestStep";
import {AbstractHttpStep} from "./HttpStep";
import {HttpClient} from "../../Http/HttpClient";

export class HttpDeleteStep extends AbstractHttpStep implements TestStep {

    http:HttpClient;
    url:string;

    constructor(parent, results, http, url, label) {
        super(parent, results, url, label);

        this.http = http;
        this.url = url;
    }

    makeCall() {
        return this.http.delete(this.url);
    }

    getType() {
        return 'DELETE';
    }
}