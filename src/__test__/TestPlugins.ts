import assert = require('power-assert');
import {Plugins} from '../Plugins';

describe('Plugins', () => {
    it('should return an empty array when no dependencies exist', () => {
        let plugins = new Plugins({
            dependencies: {}
        });

        assert.ok(Array.isArray(plugins.plugins));
        assert.equal(0, plugins.plugins.length);
    });

    it('should return an empty array when no dependencies match', () => {
        let plugins = new Plugins({
            dependencies: {
                'not-a-turbulence-plugin': '9.9.9'
            }
        });

        assert.ok(Array.isArray(plugins.plugins));
        assert.equal(0, plugins.plugins.length);
    });

    it('should return a turbulence plugin when it exists', () => {
        let plugins = new Plugins({
            dependencies: {
                'turbulence-super-plugin': '1.0.0'
            }
        });

        assert.deepEqual(['turbulence-super-plugin'], plugins.plugins);
    });

    it('should filter plugins that do not begin with "turbulence"', () => {
        let plugins = new Plugins({
            dependencies: {
                'not-a-turbulence-plugin': '1.9.9',
                'turbulence-super-plugin': '1.0.0'
            }
        });

        assert.deepEqual(['turbulence-super-plugin'], plugins.plugins);
    });

    it('should filter plugins that do not end with "plugin"', () => {
        let plugins = new Plugins({
            dependencies: {
                'not-a-turbulence-plugin': '1.9.9',
                'turbulence-super-plugin': '1.0.0',
                'turbulence-chezburgur-plugin-fir-catz': '1.9.9'
            }
        });

        assert.deepEqual(['turbulence-super-plugin'], plugins.plugins);
    });
});
