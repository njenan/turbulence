import Q = require('q');
import {HttpResponse} from "../../../Http/HttpResponse";

export function JsonBodyTransformer(resp: HttpResponse): Q.Promise<any> {
    return Q.resolve(JSON.parse(resp.rawBody));
}