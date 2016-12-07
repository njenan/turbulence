import Q = require('q');

export function ExecuteInSequence<T>(executables: (() => Q.Promise<T>)[]): Q.Promise<T[]> {
    return executables.reduce((promise, executable) => {
        return promise.then((results) => {
            return executable().then((result) => {
                results.push(result);
                return results;
            });
        });
    }, Q.resolve([]));
}
