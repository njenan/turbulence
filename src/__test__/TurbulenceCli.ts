import Q = require('q');
import child_process = require('child_process');
let spawn = child_process.spawn;

export function TurbulenceCli(args) {
    let deferred = Q.defer();
    let turbulence = spawn('node', ['./index.js'].concat(args.args));

    if (args.stdin) {
        turbulence.stdin.write(args.stdin);
        turbulence.stdin.end();
    }

    let data = '';
    turbulence.stdout.on('data', (chunk) => {
        data += chunk.toString();
    });

    let err = '';
    turbulence.stderr.on('data', (chunk) => {
        err += chunk.toString();
    });

    turbulence.on('close', () => {
        if (err !== '') {
            deferred.reject(err);
        } else {
            deferred.resolve(data);
        }
    });

    return deferred.promise;
}
