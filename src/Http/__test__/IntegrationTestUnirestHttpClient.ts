// tslint:disable-next-line:no-var-requires
let unirest = require('unirest');

import assert = require('power-assert');
import {HttpClient} from '../HttpClient';
import {UnirestHttpClient} from '../UnirestHttpClient';

describe('Unirest Http Client', () => {
    let client: HttpClient;

    before((done) => {
        client = new UnirestHttpClient();

        unirest.post('http://localhost:2525/imposters')
            .send(JSON.stringify(
                {
                    port: 4545,
                    protocol: 'http',
                    stubs: [
                        {
                            predicates: [{equals: {headers: {headerOne: 'valueOne'}, method: 'GET'}}],
                            responses: [{is: {body: 'Get response', statusCode: 200}}]
                        },
                        {
                            predicates: [{
                                equals: {
                                    body: 'post rawBody',
                                    headers: {headerTwo: 'valueTwo'},
                                    method: 'POST'
                                }
                            }],
                            responses: [{is: {body: 'Post response', statusCode: 201}}]
                        },
                        {
                            predicates: [{
                                equals: {
                                    body: 'put rawBody',
                                    headers: {headerThree: 'valueThree'},
                                    method: 'PUT'
                                }
                            }],
                            responses: [{is: {body: 'Put response', statusCode: 202}}]
                        },
                        {
                            predicates: [{equals: {headers: {headerFour: 'valueFour'}, method: 'HEAD'}}],
                            responses: [{is: {body: 'Head response', statusCode: 203}}]
                        },
                        {
                            predicates: [{equals: {headers: {headerFive: 'valueFive'}, method: 'DELETE'}}],
                            responses: [{is: {statusCode: 204}}]
                        },
                        {
                            responses: [{is: {statusCode: 205}}]
                        }
                    ]
                }
            ))
            .end(() => {
                done();
            });
    });

    after((done) => {
        unirest.delete('http://localhost:2525/imposters')
            .end(() => {
                done();
            });
    });

    it('should send a GET request', () => {
        return client.get('http://localhost:4545', {headerOne: 'valueOne'}).then((resp) => {
            assert.equal(resp.statusCode, 200);
            assert.equal(resp.rawBody, 'Get response');
        });
    });

    it('should send a POST request', () => {
        return client.post('http://localhost:4545', 'post rawBody', {headerTwo: 'valueTwo'}).then((resp) => {
            assert.equal(resp.statusCode, 201);
            assert.equal(resp.rawBody, 'Post response');
        });
    });

    it('should send a PUT request', () => {
        return client.put('http://localhost:4545', 'put rawBody', {headerThree: 'valueThree'}).then((resp) => {
            assert.equal(resp.statusCode, 202);
            assert.equal(resp.rawBody, 'Put response');
        });
    });

    it('should send a HEAD request', () => {
        return client.head('http://localhost:4545', {headerFour: 'valueFour'}).then((resp) => {
            assert.equal(resp.statusCode, 203);
        });
    });

    it('should send a DELETE request', () => {
        return client.delete('http://localhost:4545', {headerFive: 'valueFive'}).then((resp) => {
            assert.equal(resp.statusCode, 204);
        });
    });

    ['get', 'post', 'put', 'delete', 'head'].forEach((entry) => {
        it('should send ' + entry + ' requests without headers', () => {
            return client[entry]('http://localhost:4545').then((resp) => {
                assert.equal(resp.statusCode, 205);
            });
        });
    });
});
