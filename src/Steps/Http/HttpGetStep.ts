import {TestStep} from '../TestStep';
import {AbstractHttpStep} from './HttpStep';

export class HttpGetStep extends AbstractHttpStep implements TestStep {

    url: string;
    headers: any;
    type: string;

    constructor(reporter, url, headers?, label?) {
        super(reporter, url, label);

        this.url = url;
        this.headers = headers;
        this.type = 'GET';
    }

    makeCall(http) {
        return http.get(this.url, this.headers);
    }

    getType() {
        return this.type;
    }
}
