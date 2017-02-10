import Q = require('q');
// tslint:disable-next-line:no-var-requires
let xpath = require('xpath');
// tslint:disable-next-line:no-var-requires
let DomParser = require('xmldom').DOMParser;
let dom = new DomParser();

export function XPathTransformer(resp) {
    let doc = dom.parseFromString(resp.rawBody);
    return Q.resolve().then(() => {
        return (path) => {
            return xpath.select(path, doc);
        };
    });
}
