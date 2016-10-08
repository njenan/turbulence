import fs = require('fs');
import assert = require('power-assert');
import {ImposterBuilder} from './Mountebank/ImposterBuilder';
import {StubBuilder} from './Mountebank/StubBuilder';
import {ResponseBuilder} from './Mountebank/ResponseBuilder';
import {TurbulenceCli} from './TurbulenceCli';
import {MountebankRequestLog} from './Mountebank/MountebankRequestLog';

// tslint:disable-next-line:no-var-requires
let unirest = require('unirest');
// tslint:disable-next-line:no-var-requires
let rimraf = require('rimraf');

describe('Turbulence', () => {
    let port = 9876;

    beforeEach((done) => {
        rimraf.sync('.tmp');
        fs.mkdirSync('.tmp');
        unirest.delete('http://localhost:2525/imposters').end(() => {
            unirest.post('http://localhost:2525/imposters').send(
                JSON.stringify(new ImposterBuilder()
                    .port(port)
                    .addStub(new StubBuilder()
                        .addResponses(new ResponseBuilder().status(222).build()).build())
                    .build()))
                .end(() => {
                    done();
                });
        });
    });

    describe('CLI', () => {
        it('should error if the turbulence file does not exist', () => {
            return TurbulenceCli({args: 'file_that_does_not_exist.turbulence'}).catch((err) => {
                assert.equal('File \'file_that_does_not_exist.turbulence\' does not exist\n', err);
            });
        });

        it('should run the specified .turbulence file', () => {
            return TurbulenceCli({args: 'examples/example2.turbulence'}).then(() => {
                return MountebankRequestLog(port);
            }).then((requests: Array<any>) => {
                assert.equal(1, requests.length);
            });
        });

        it('should run multiple specified .turbulence files', () => {
            return TurbulenceCli({args: ['examples/example2.turbulence', 'examples/example2.turbulence']}).then(() => {
                return MountebankRequestLog(port);
            }).then((requests: Array<any>) => {
                assert.equal(2, requests.length);
            });
        });

        it('should take test plan input from stdin', () => {
            return TurbulenceCli({args: '{}', stdin: fs.readFileSync('examples/example2.turbulence')}).then(() => {
                return MountebankRequestLog(port);
            }).then((requests: Array<any>) => {
                assert.equal(1, requests.length);
            });
        });

        it('should parse the concatenated output of multiple turbulence files sent to stdin', () => {
            let testPlan = fs.readFileSync('examples/example2.turbulence').toString();
            return TurbulenceCli({args: '{}', stdin: testPlan + testPlan}).then(() => {
                return MountebankRequestLog(port);
            }).then((requests: Array<any>) => {
                assert.equal(2, requests.length);
            });
        });

        it('should run a .turbulence file in the directory when given no args', () => {
            let file = fs.readFileSync('examples/example2.turbulence');
            fs.writeFileSync('.tmp/one.turbulence', file);

            return TurbulenceCli({cwd: '.tmp', file: '../index.js'}).then(() => {
                return MountebankRequestLog(port);
            }).then((requests: Array<any>) => {
                assert.equal(1, requests.length);
            });
        });

        it('should run all .turbulence files in a directory when given no args', () => {
            let file = fs.readFileSync('examples/example2.turbulence');
            fs.writeFileSync('.tmp/one.turbulence', file);
            fs.writeFileSync('.tmp/two.turbulence', file);
            fs.writeFileSync('.tmp/three.turbulence', file);

            return TurbulenceCli({cwd: '.tmp', file: '../index.js'}).then(() => {
                return MountebankRequestLog(port);
            }).then((requests: Array<any>) => {
                assert.equal(3, requests.length);
            });
        });

        it('should run all .turbulence files in sub-directories when given no args', () => {
            fs.mkdirSync('.tmp/sub1');
            fs.mkdirSync('.tmp/sub2');

            let file = fs.readFileSync('examples/example2.turbulence');
            fs.writeFileSync('.tmp/sub1/one.turbulence', file);
            fs.writeFileSync('.tmp/sub2/two.turbulence', file);

            return TurbulenceCli({cwd: '.tmp', file: '../index.js'}).then(() => {
                return MountebankRequestLog(port);
            }).then((requests: Array<any>) => {
                assert.equal(2, requests.length);
            });
        });

        it('should allow glob patterns', () => {
            fs.mkdirSync('.tmp/sub1');
            fs.mkdirSync('.tmp/sub2');

            let file = fs.readFileSync('examples/example2.turbulence');
            fs.writeFileSync('.tmp/sub1/one.turbulence', file);
            fs.writeFileSync('.tmp/sub2/one.turbulence', file);
            fs.writeFileSync('.tmp/sub2/two.turbulence', file);

            return TurbulenceCli({args: '**/one.turbulence', cwd: '.tmp', file: '../index.js'}).then(() => {
                return MountebankRequestLog(port);
            }).then((requests: Array<any>) => {
                assert.equal(2, requests.length);
            });
        });

        it('should write an html report after executing', () => {
            fs.unlinkSync('Report.html');
            return TurbulenceCli({args: 'examples/example2.turbulence'}).then(() => {
                assert.ok(fs.statSync('Report.html').isFile());
            });
        });

        it('should provide a json reporter', () => {
            return TurbulenceCli({args: ['examples/example2.turbulence', '--reporter=JsonReportGenerator']})
                .then(JSON.parse)
                .then((report) => {
                    assert.equal(1, report.requests.length);
                });
        });
    });

    describe('plugins', () => {
        it('should allow existing plugins to be overridden', () => {
            return TurbulenceCli({args: 'example.turbulence', cwd: 'subproject', file: '../index.js'}).then(() => {
                return null;
            });
        });
    });
});
