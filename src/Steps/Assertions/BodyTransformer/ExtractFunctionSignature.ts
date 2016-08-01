export function ExtractFunctionSignature(signature:string):any {
    var args = /\(\s*([^)]+?)\s*\)/.exec(signature).pop().split(',').map((entry) => {
        return entry.trim();
    });

    var i = 0;

    return args.reduce((accumulator, next) => {
        accumulator[next] = i++;
        return accumulator;
    }, {});

    /*
     if (signature.indexOf("JsonBody") !== -1) {
     return {jsonBody: 0};
     } else if (signature.indexOf("XmlBody") !== -1) {
     return {xmlBody: 0};
     } else if (signature.indexOf("Response") !== -1) {
     return {resp: 0};
     } else if (signature.indexOf("JsonPath") !== -1) {
     return {jsonPath: 0};
     } else {
     return {};
     }
     */
}
