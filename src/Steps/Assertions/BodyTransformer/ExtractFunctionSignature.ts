export function ExtractFunctionSignature(signature: string): any {
    let rawArgs = /\(\s*([^)]+?)\s*\)/.exec(signature);

    if (!rawArgs) {
        return {};
    }

    let args = rawArgs.pop().split(',').map((entry) => {
        return entry.trim();
    });

    let i = 0;

    return args.reduce((accumulator, next) => {
        accumulator[next] = i++;
        return accumulator;
    }, {});
}
