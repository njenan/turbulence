import Q = require('q');
import {HttpClient} from '../Http/HttpClient';

export interface TestStep {

    type: string;

    /**
     * @hidden
     * @param http
     * @param data
     */
    execute<I, O>(http: HttpClient, data?: I): Q.Promise<O>;

}
