import {BodyType} from "../BodyType/BodyType";
import {BodyTransformer} from "../BodyTransformer/BodyTransformer";
import {JsonBodyTransformer} from "./JsonBodyTransformer";

export function BodyTransformerFactory(type:BodyType):BodyTransformer {
    return JsonBodyTransformer;
}