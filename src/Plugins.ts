export class Plugins {
    plugins;

    constructor(packageJson) {
        this.plugins = !packageJson.dependencies ? [] : Object.keys(packageJson.dependencies).filter((entry) => {
            return /^turbulence.*plugin$/.test(entry);
        });
    }
}
