/// <reference path="../../../typings/main/ambient/assert/index.d.ts" />

var unirest = require('unirest');

import assert = require('power-assert');
import {HttpClient} from "../HttpClient";
import {UnirestHttpClient} from "../UnirestHttpClient";


describe('Unirest Http Client', () => {
    var client:HttpClient;

    before((done) => {
        client = new UnirestHttpClient();

        unirest.post('http://localhost:2525/imposters')
            .send(JSON.stringify(
                {
                    port: 4545,
                    protocol: 'http',
                    stubs: [
                        {
                            predicates: [{equals: {method: 'GET', headers: {headerOne: 'valueOne'}}}],
                            responses: [{is: {statusCode: 200, body: 'Get response'}}]
                        },
                        {
                            predicates: [{
                                equals: {
                                    method: 'POST',
                                    body: 'post rawBody',
                                    headers: {headerTwo: 'valueTwo'}
                                }
                            }],
                            responses: [{is: {statusCode: 201, body: 'Post response'}}]
                        },
                        {
                            predicates: [{
                                equals: {
                                    method: 'PUT',
                                    body: 'put rawBody',
                                    headers: {headerThree: 'valueThree'}
                                }
                            }],
                            responses: [{is: {statusCode: 202, body: 'Put response'}}]
                        },
                        {
                            predicates: [{equals: {method: 'HEAD', headers: {headerFour: 'valueFour'}}}],
                            responses: [{is: {statusCode: 203, body: 'Head response'}}]
                        },
                        {
                            predicates: [{equals: {method: 'DELETE', headers: {headerFive: 'valueFive'}}}],
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
