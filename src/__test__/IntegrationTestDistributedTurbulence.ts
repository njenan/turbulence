import fs = require('fs');
import assert = require('power-assert');
import Q = require('q');
import {TurbulenceCli} from './TurbulenceCli';

// tslint:disable-next-line:no-var-requires
let rimraf = require('rimraf');

describe('Distributed Turbulence', () => {
    beforeEach(() => {
        rimraf.sync('.tmp');
        fs.mkdirSync('.tmp');
    });

    describe('slave', () => {
        it('should wait for connections', () => {
            return Q.race([TurbulenceCli({
                args: '--slave',
                cwd: '.tmp',
                file: '../index.js',
                killAfter: 1250
            }), Q.resolve('Not the CLI').delay(1000)]).then((data) => {
                assert.equal('Not the CLI', data);
            });
        });
    });

    describe('master', () => {
        it('should error if no slave address is provided', () => {
            return TurbulenceCli({args: '--master', cwd: '.tmp', file: '../index.js'}).then(() => {
                throw new Error('This shouldn\'t get executed');
            }).catch((err) => {
                assert.equal('Must supply at least 1 slave url\n', err);
            });
        });

        it('should send the test plan to the executor', () => {
            TurbulenceCli({args: '--slave', killAfter: 3000});
            return TurbulenceCli({
                args: ['../examples/example2.turbulence', '--master localhost:7777'],
                cwd: '.tmp',
                file: '../index.js'
            }).then(() => {
                fs.readFileSync('.tmp/Report.html');
            });
        });
    });
});
