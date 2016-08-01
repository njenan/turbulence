export function ExtractFunctionSignature(signature:string):any {
    var args = /\(\s*([^)]+?)\s*\)/.exec(signature).pop().split(',').map((entry) => {
        return entry.trim();
    });

    var i = 0;

    return args.reduce((accumulator, next) => {
        accumulator[next] = i++;
        return accumulator;
    }, {});
}
