import {TestStep} from '../TestStep';
import {AbstractHttpStep} from './HttpStep';

export class HttpDeleteStep extends AbstractHttpStep implements TestStep {

    url: string;
    headers: string;
    type: string;

    constructor(results, reporter, url, headers?, label?) {
        super(results, reporter, url, label);

        this.url = url;
        this.headers = headers;
        this.type = 'DELETE';
    }

    makeCall(http) {
        return http.delete(this.url, this.headers);
    }

    getType() {
        return this.type;
    }
}
