import assert = require('power-assert');
import {Cli} from '../Cli';
import {StubHttpClient} from '../Http/__test__/StubHttpClient';

describe('Cli', () => {
    let cli;
    let pluginFactory;

    before(() => {
        pluginFactory = {
            get: (type) => {
                return () => {
                    return () => {
                        return pluginFactory[type];
                    };
                };
            }
        };

        cli = new Cli(
            new StubHttpClient(),
            () => {
                return null;
            },
            pluginFactory
        );
    });

    ['ReportGenerator', 'HttpClient'].forEach((pluginType) => {
        it('should pass found ' + pluginType + ' plugins to Turbulence', () => {
            pluginFactory[pluginType] = 'Alpha';

            return cli.buildTurbulence().then((args) => {
                assert.equal('Alpha', args[0].reportGenerator());
            });
        });
    });
});
