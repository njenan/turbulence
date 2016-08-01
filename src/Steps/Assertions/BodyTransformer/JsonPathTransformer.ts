/// <reference path="../../../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');
import {JsonBodyTransformer} from "./JsonBodyTransformer";

var jsonpath = require('jsonpath-plus');

export function JsonPathTransformer(resp) {
    return JsonBodyTransformer(resp).then((jsonBody) => {
        return (path) => {
            return jsonpath({path: path, json: jsonBody});
        };
    });
}
