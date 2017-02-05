import {TestStep} from '../TestStep';
import {AbstractHttpStep} from './HttpStep';

export class HttpPostStep extends AbstractHttpStep implements TestStep {

    url: string;
    body: any;
    headers: any;
    type: string;

    constructor(reporter, url, body, headers?, label?) {
        super(reporter, url, label);

        this.url = url;
        this.body = body;
        this.headers = headers;
        this.type = 'POST';
    }

    makeCall(http) {
        return http.post(this.url, this.body, this.headers);
    }

    getType() {
        return this.type;
    }
}
