import {TestStep} from "../TestStep";
import {AbstractHttpStep} from "./HttpStep";

export class HttpGetStep extends AbstractHttpStep implements TestStep {

    url: string;
    headers: any;

    constructor(parent, results, url, headers?, label?) {
        super(parent, results, url, label);

        this.url = url;
        this.headers = headers;
    }

    makeCall(http) {
        return http.get(this.url, this.headers);
    }

    getType() {
        return 'GET';
    }
}