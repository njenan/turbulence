import {ResponseBodyNoOpTransformer} from "./ResponseBodyNoOpTransformer";
import {XmlBodyTransformer} from "./XmlBodyTransformer";
import {JsonPathTransformer} from "./JsonPathTransformer";
import {JsonBodyTransformer} from "./JsonBodyTransformer";

export function TransformerFactory(type) {
    return {
        Response: ResponseBodyNoOpTransformer,
        XmlBody: XmlBodyTransformer,
        JsonPath: JsonPathTransformer,
        JsonBody: JsonBodyTransformer
    }[type];
}