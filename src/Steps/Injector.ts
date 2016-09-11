import {ExtractFunctionSignature} from './Assertions/BodyTransformer/ExtractFunctionSignature';
import {TransformerFactory} from './Assertions/BodyTransformer/TransformerFactory';

export class Injector {
    inject(promise, resp, validator) {
        let signature = ExtractFunctionSignature(validator.toString());

        for (let k in signature) {
            let transformer = TransformerFactory(k);
            if (transformer) {
                // Function is here so that the loop doesn't overwrite the transformer and k variables
                ((transformer, k) => {
                    // Wrapped in a promise so that execution is postponed
                    promise = promise.then((args) => {
                        return transformer(resp).then((arg) => {
                            args.args[signature[k]] = arg;
                            return args;
                        });
                    });
                })(transformer, k);
            }
        }
        return promise;
    }
}
