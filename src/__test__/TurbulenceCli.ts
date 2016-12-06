import {PromisifiedProcess} from './PromisifiedProcess';

export function TurbulenceCli(args) {
    let file = args.file ? args.file : './index.js';
    let executable = 'node';
    let executableArgs = [file].concat(args.args ? args.args : []);

    return PromisifiedProcess([executable].concat(executableArgs), args);
}
