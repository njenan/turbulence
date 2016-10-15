import Q = require('q');
import child_process = require('child_process');
let spawn = child_process.spawn;

export function TurbulenceCli(args) {
    let deferred = Q.defer();

    try {
        let options = args.cwd ? {cwd: args.cwd} : {};
        let file = args.file ? args.file : './index.js';
        let turbulence = spawn('node', [file].concat(args.args ? args.args : []), options);

        setTimeout(() => {
            turbulence.kill('SIGKILL');
        }, args.killAfter ? args.killAfter : 5000);

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
    } catch (e) {
        deferred.reject(e);
    }

    return deferred.promise;
}
