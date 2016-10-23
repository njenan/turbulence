import fs = require('fs');
import Q = require('q');
import {Turbulence} from './Turbulence';
import {LocalExecutor} from './Executors/LocalExecutor';
import {RemoteExecutor} from './Executors/RemoteExecutor';
import {PluginFactory} from './PluginFactory';

// No typings exist for globule TODO write them
// tslint:disable-next-line:no-var-requires
let globule = require('globule');

export class Cli {
    args;
    filenames;
    plugins;
    pluginFactory;

    constructor(args, filenames, plugins) {
        this.args = args;
        this.filenames = filenames;
        this.plugins = plugins;
        this.pluginFactory = new PluginFactory(plugins.plugins);
    }

    readFile(path) {
        let deferred = Q.defer();

        fs.readFile(path, (err, data) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(data);
            }
        });

        return deferred.promise;
    }

    execute() {
        let promise;
        if (this.filenames[0] === '{}') {
            promise = this.readFromStdin();
        } else {
            promise = this.readFromArguments(this.filenames);
        }

        return promise
            .then(this.buildTurbulence)
            .then(this.invokeTurbulence)
            .catch(console.error);
    }

    readFromStdin() {
        let deferred = Q.defer();

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

        return deferred.promise;
    }

    readFromArguments(filenames) {
        if (this.args.master) {
            if (typeof this.args.master !== 'string') {
                return Q.reject('Must supply at least 1 slave url');
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

        return Q.all(filenames.map((filename) => {
            return this.readFile(filename).then((file) => {
                files += file;
            }).catch((err) => {
                errors += err;
            });
        })).then(() => {
            if (errors !== '') {
                return Q.reject(errors);
            } else {
                return Q.resolve(files);
            }
        });

    }

    buildTurbulence = (file) => {
        let Executor;
        if (this.args.master) {
            Executor = RemoteExecutor;
        } else {
            Executor = LocalExecutor;
        }

        let Reporter = this.pluginFactory.get('ReportGenerator');
        let HttpClient = this.pluginFactory.get('HttpClient');

        let turbulence = new Turbulence(new HttpClient(), new Executor(), new Reporter());

        return Q.resolve([turbulence, file]);
    };

    invokeTurbulence(args) {
        // tslint:disable-next-line:no-unused-variable
        let turbulence = args[0];
        let file = args[1];
        // tslint:disable-next-line:no-eval
        return eval(file);
    }
}
