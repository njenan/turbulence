import fs = require('fs');
import Q = require('q');

// No typings exist for globule TODO write them
// tslint:disable-next-line:no-var-requires
let globule = require('globule');

export class Cli {

    setUpTurbulence(filenames, args) {
        let deferred = Q.defer();
        if (filenames[0] === '{}') {
            this.readFromStdin(deferred);
        } else {
            this.readFromArguments(args, filenames, deferred);
        }

        return deferred.promise;
    }

    readFromStdin(deferred) {
        let file = '';
        process.stdin.on('readable', () => {
            let chunk = process.stdin.read();
            if (chunk !== null) {
                file += chunk;
            }
        });

        process.stdin.on('end', () => {
            deferred.resolve(file);
        });
    }

    readFromArguments(args, filenames, deferred) {
        if (args.master) {
            if (typeof args.master !== 'string') {
                deferred.reject('Must supply at least 1 slave url');
            }
        }

        if (filenames.length === 0) {
            filenames = globule.find('**/*.turbulence');
        } else {
            filenames = filenames.reduce((array, next) => {
                return array.concat(globule.find(next));
            }, []);
        }

        let errors = '';
        let files = '';
        let x = 0;
        for (let i = 0; i < filenames.length; i++) {
            let name = filenames[i];
            fs.readFile(name, (err, file) => {
                if (err) {
                    errors += 'File \'' + name + '\' does not exist';
                } else {
                    files += file;
                    x++;
                    if (x === filenames.length && errors === '') {
                        deferred.resolve(files);
                    }

                    if (errors !== '') {
                        deferred.reject(errors);
                    }
                }
            });
        }
    }
}
