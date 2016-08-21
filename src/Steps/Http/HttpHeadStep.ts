import {AbstractHttpStep} from "./HttpStep";
import {TestStep} from "../TestStep";

export class HttpHeadStep extends AbstractHttpStep implements TestStep {

    url: string;
    headers: any;

    constructor(results, url, headers?, label?) {
        super(results, url, label);

        this.url = url;
        this.headers = headers;
    }

    makeCall(http) {
        return http.head(this.url, this.headers);
    }

    getType() {
        return 'HEAD';
    }
}