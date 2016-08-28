import {TestStep} from "../TestStep";
import {AbstractHttpStep} from "./HttpStep";

export class HttpPutStep extends AbstractHttpStep implements TestStep {

    url: string;
    body: any;
    headers: any;
    type: string;

    constructor(results, url, body, headers?, label?) {
        super(results, url, label);

        this.url = url;
        this.body = body;
        this.headers = headers;
        this.type = 'PUT';
    }

    makeCall(http) {
        return http.post(this.url, this.body, this.headers);
    }

    getType() {
        return this.type
    }
}