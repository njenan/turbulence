import fs = require('fs');
import Q = require('q');
import Yaml = require('js-yaml');
import assert = require('power-assert');
import {ImposterBuilder} from './Mountebank/ImposterBuilder';
import {StubBuilder} from './Mountebank/StubBuilder';
import {ResponseBuilder} from './Mountebank/ResponseBuilder';
import {TurbulenceCli} from './TurbulenceCli';
import {MountebankRequestLog} from './Mountebank/MountebankRequestLog';
import {PromisifiedProcess} from './PromisifiedProcess';

let Execute = PromisifiedProcess;

Q.longStackSupport = true;

// tslint:disable-next-line:no-var-requires
let unirest = require('unirest');
// tslint:disable-next-line:no-var-requires
let rimraf = require('rimraf');

function safeUnlink(path) {
    try {
        fs.unlinkSync(path);
    } catch (e) { /* swallow exception */
    }
}

describe('Turbulence', () => {
    let port = 9876;

    beforeEach((done) => {
        rimraf.sync('subproject');
        safeUnlink('subproject');
        fs.mkdirSync('./subproject');

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

    afterEach(() => {
        rimraf.sync('subproject');
        safeUnlink('subproject');

        rimraf.sync('.tmp');
        safeUnlink('.tmp');
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

        it('should provide a json reporter', () => {
            return TurbulenceCli({args: ['examples/example2.turbulence', '--reporter=JsonReportGenerator']})
                .then(JSON.parse)
                .then((report) => {
                    assert.equal(1, report.requests.length);
                });
        });
    });

    describe('plugins', () => {
        function installPlugin(plugin) {
            return () => {
                return Execute(['npm', 'install', '--save', '../plugins/' + plugin],
                    {cwd: './subproject'});
            };
        }

        function writeTest() {
            fs.writeFileSync('./subproject/mytest.turbulence',
                `turbulence
                    .startUserSteps()
                            .get('http://turbulence.io/')
                            .expectStatus(200)
                            .randomPause(2000, 10000)
                        .concurrentUsers(10)
                        .duration(5000)
                    .endUserSteps()
                    .run();`
            );
        }

        function runTest() {
            return Execute(['node', '../index.js', 'mytest.turbulence'], {cwd: 'subproject'});
        }

        // tslint:disable-next-line:only-arrow-functions
        it('should allow plugins to be installed', function () {
            this.timeout(60000);

            return Execute(['npm', 'init', '-f'], {cwd: './subproject'})
            // catching because -f causes npm to output to stderr and fail the stepl
                .catch(installPlugin('turbulence-yaml-reporter-plugin'))
                // catching because install places warning onto stderr
                .catch(writeTest)
                .then(runTest)
                .then((report: string) => {
                    return {
                        object: Yaml.load(report),
                        raw: report
                    };
                })
                .then((report) => {
                    let expected = Yaml.safeDump(report.object);
                    let actual = report.raw;

                    assert.equal(actual.trim(), expected.trim());
                });
        });

        // tslint:disable-next-line:only-arrow-functions
        it('should error on multiple plugins', function () {
            this.timeout(60000);

            return Execute(['npm', 'init', '-f'], {cwd: './subproject'})
            // catching because -f causes npm to output to stderr and fail the step
                .catch(installPlugin('turbulence-yaml-reporter-plugin'))
                // catching because -f causes npm to output to stderr and fail the step
                .catch(installPlugin('turbulence-xml-reporter-plugin'))
                // catching because install places warning onto stderr
                .catch(writeTest)
                .then(runTest)
                .then(() => {
                    assert.ok(false);
                })
                .catch((err) => {
                    assert.ok(err.indexOf('Found multiple plugins of type \'ReportGenerator\' installed in local ' +
                            'repo.  Uninstall duplicate types or specify single plugin with ' +
                            '--ReportGenerator=PLUGIN_NAME_HERE') !== -1);
                });
        });
    });
});
