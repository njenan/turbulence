import Q = require('q');

export function ResponseBodyNoOpTransformer(resp) {
    return Q.resolve(resp);
}
