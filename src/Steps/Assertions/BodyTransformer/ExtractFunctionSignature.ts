export function ExtractFunctionSignature(signature: string): any {
    var rawArgs = /\(\s*([^)]+?)\s*\)/.exec(signature);

    if (!rawArgs) {
        return {};
    }

    var args = rawArgs.pop().split(',').map((entry) => {
        return entry.trim();
    });

    var i = 0;

    return args.reduce((accumulator, next) => {
        accumulator[next] = i++;
        return accumulator;
    }, {});
}
