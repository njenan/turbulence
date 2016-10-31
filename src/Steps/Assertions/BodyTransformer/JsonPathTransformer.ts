import {JsonBodyTransformer} from './JsonBodyTransformer';

// tslint:disable-next-line:no-var-requires
let jsonpath = require('jsonpath-plus');

export function JsonPathTransformer(resp) {
    return JsonBodyTransformer(resp).then((jsonBody) => {
        return (path) => {
            return jsonpath({json: jsonBody, path: path});
        };
    });
}
