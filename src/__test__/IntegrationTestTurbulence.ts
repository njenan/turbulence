import child_process = require('child_process');

var exec = child_process.exec;

describe('Turbulence', () => {
    function runTurbulence(args, cb) {
        var command = 'node ./index.js';
        if (args) {
            command += ' ' + args;
        }

        return exec(command, cb);
    }

    describe('CLI', () => {
        xit('should run the specified .turbulence file', (done) => {
            runTurbulence('example.turbulence', () => {
                done();
            });
        });

        xit('should run all .turbulence files in the directory when given no args', () => {

        });

        xit('should run all .turbulence files in sub-directories when given no args', () => {

        });

        xit('should allow patterns to be included', () => {

        });

        xit('should allow patterns to be excluded', () => {

        });

        xit('should write an html report after executing', () => {
        });

    });

});
