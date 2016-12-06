import Q = require('q');
import child_process = require('child_process');

let spawn = child_process.spawn;

export function PromisifiedProcess(command, args) {
    let deferred = Q.defer();

    try {
        let process = spawn(command.shift(), command, {cwd: args.cwd});

        if (args.killAfter) {
            setTimeout(() => {
                process.kill('SIGKILL');
            }, args.killAfter);
        }

        if (args.stdin) {
            process.stdin.write(args.stdin);
            process.stdin.end();
        }

        let data = [];
        process.stdout.on('data', (chunk) => {
            data.push(chunk.toString());
        });

        let err = [];
        process.stderr.on('data', (chunk) => {
            err.push(chunk.toString());
        });

        process.on('close', () => {
            if (err.length !== 0) {
                deferred.reject(err.join(''));
            } else {
                deferred.resolve(data.join(''));
            }
        });
    } catch (e) {
        deferred.reject(e);
    }

    return deferred.promise;
}
