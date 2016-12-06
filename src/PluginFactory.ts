import {JsonReportGenerator} from './Reporters/JsonReportGenerator';
import {UnirestHttpClient} from './Http/UnirestHttpClient';

export class PluginFactory {
    plugins;
    defaultPlugins = {
        'ReportGenerator': JsonReportGenerator,
        'HttpClient': UnirestHttpClient
    };

    constructor(plugins) {
        this.plugins = plugins.map((name) => {
            let plugin = require(process.cwd() + '/node_modules/' + name);
            return {
                main: plugin.main,
                type: plugin.type
            };
        });
    }

    get(type) {
        let candidates = this.plugins.filter((plugin) => {
            return plugin.type === type;
        });

        if (candidates.length > 1) {
            throw new Error('Found multiple plugins of type \'' + type + '\' installed in local repo.  ' +
                'Uninstall duplicate types or specify single plugin with --ReportGenerator=PLUGIN_NAME_HERE');
        } else if (candidates.length === 0) {
            return this.defaultPlugins[type];
        } else {
            return candidates[0].main;
        }
    }
}
