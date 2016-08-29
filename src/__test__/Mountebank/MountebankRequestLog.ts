import Q = require('q');
let unirest = require('unirest');

export function MountebankRequestLog(port) {
    let deferred = Q.defer();

    unirest.get('http://localhost:2525/imposters/' + port).end((res) => {
        deferred.resolve(res.body.requests);
    });

    return deferred.promise;
}
