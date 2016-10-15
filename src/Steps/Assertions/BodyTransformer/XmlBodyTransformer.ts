import Q = require('q');

import {HttpResponse} from "../../../Http/HttpResponse";
import xml2js = require('xml2js');

var parseXml = new xml2js.Parser({explicitArray: false}).parseString;

export function XmlBodyTransformer(resp: HttpResponse): Q.Promise<any> {
    var deferred = Q.defer();

    parseXml(resp.rawBody, (err, result) => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}
