import {TestStep} from "../TestStep";
import {AbstractHttpStep} from "./HttpStep";

export class HttpPutStep extends AbstractHttpStep implements TestStep {

    url: string;
    body: any;
    headers: any;

    constructor(parent, results, url, body, headers?, label?) {
        super(parent, results, url, label);

        this.url = url;
        this.body = body;
        this.headers = headers;
    }

    makeCall(http) {
        return http.post(this.url, this.body, this.headers);
    }

    getType() {
        return 'PUT';
    }
}