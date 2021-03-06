import Q = require('q');
import {HttpClient} from './HttpClient';
import {HttpResponse} from './HttpResponse';

// No typings exist for unirest TODO write them
// tslint:disable-next-line:no-var-requires
let unirest = require('unirest');

export class UnirestHttpClient implements HttpClient {

    get(url: string, headers?: any): Q.Promise<HttpResponse> {
        return this.request(unirest.get, url, null, headers);
    }

    post(url: string, body: any, headers?: any): Q.Promise<HttpResponse> {
        return this.request(unirest.post, url, body, headers);
    }

    put(url: string, body: any, headers?: any): Q.Promise<HttpResponse> {
        return this.request(unirest.put, url, body, headers);
    }

    head(url: string, headers?: any): Q.Promise<HttpResponse> {
        return this.request(unirest.head, url, null, headers);
    }

    delete(url: string, headers?: any): Q.Promise<HttpResponse> {
        return this.request(unirest.delete, url, null, headers);
    }

    request(request, url, body, headers) {
        let deferred = Q.defer<HttpResponse>();

        request = request(url);

        if (headers) {
            request = request.headers(headers);
        }

        if (body) {
            request = request.send(body);
        }

        request.end((response) => {
            deferred.resolve(new HttpResponse(response.body, response.statusCode));
        });

        return deferred.promise;
    }
}
