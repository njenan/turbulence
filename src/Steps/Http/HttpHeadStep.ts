import {AbstractHttpStep} from './HttpStep';
import {TestStep} from '../TestStep';

export class HttpHeadStep extends AbstractHttpStep implements TestStep {

    url: string;
    headers: any;
    type: string;

    constructor(reporter, url, headers?, label?) {
        super(reporter, url, label);

        this.url = url;
        this.headers = headers;
        this.type = 'HEAD';
    }

    makeCall(http) {
        return http.head(this.url, this.headers);
    }

    getType() {
        return this.type;
    }
}
