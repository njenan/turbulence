import Q = require('q');
import {Global} from '../../Global';

export function GlobalTransformer(): Q.Promise<any> {
    return Q.resolve(Global.Global);
}
