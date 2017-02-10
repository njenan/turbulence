import {ResponseBodyNoOpTransformer} from './ResponseBodyNoOpTransformer';
import {XmlBodyTransformer} from './XmlBodyTransformer';
import {JsonPathTransformer} from './JsonPathTransformer';
import {JsonBodyTransformer} from './JsonBodyTransformer';
import {XPathTransformer} from './XPathTransformer';
import {GlobalTransformer} from './GlobalTransformer';

export function TransformerFactory(type) {
    return {
        Global: GlobalTransformer,
        JsonBody: JsonBodyTransformer,
        JsonPath: JsonPathTransformer,
        Response: ResponseBodyNoOpTransformer,
        XPath: XPathTransformer,
        XmlBody: XmlBodyTransformer
    }[type];
}
