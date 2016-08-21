import {TestStep} from "../TestStep";
import {AbstractHttpStep} from "./HttpStep";

export class HttpDeleteStep extends AbstractHttpStep implements TestStep {

    url: string;
    headers: string;

    constructor(results, url, headers?, label?) {
        super(results, url, label);

        this.url = url;
        this.headers = headers;
    }

    makeCall(http) {
        return http.delete(this.url, this.headers);
    }

    getType() {
        return 'DELETE';
    }
}