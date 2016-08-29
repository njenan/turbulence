import fs = require('fs');
import assert = require('power-assert');
import {ImposterBuilder} from './Mountebank/ImposterBuilder';
import {StubBuilder} from './Mountebank/StubBuilder';
import {ResponseBuilder} from './Mountebank/ResponseBuilder';
import {TurbulenceCli} from './TurbulenceCli';
import {MountebankRequestLog} from './Mountebank/MountebankRequestLog';

// tslint:disable-next-line:no-var-requires
let unirest = require('unirest');

describe('Turbulence', () => {
    let port = 9876;

    beforeEach((done) => {
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

        xit('should run all .turbulence files in the directory when given no args', () => {
            return null;
        });

        xit('should run all .turbulence files in sub-directories when given no args', () => {
            return null;
        });

        xit('should allow patterns to be included', () => {
            return null;
        });

        xit('should allow patterns to be excluded', () => {
            return null;
        });

        it('should write an html report after executing', () => {
            fs.unlinkSync('Report.html');
            return TurbulenceCli({args: 'examples/example2.turbulence'}).then(() => {
                assert.ok(fs.statSync('Report.html').isFile());
            });
        });
    });

    describe('Distributed testing', () => {
        xit('should listen on port 7777 for websocket connections(?)', () => {
            return null;
        });
    });
});
