/// <reference path="../../../../typings/main/ambient/q/index.d.ts" />

import Q = require('q');

export function ResponseBodyNoOpTransformer(resp) {
    return Q.resolve(resp);
}