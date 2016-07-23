/// <reference path="../../../typings/main/ambient/assert/index.d.ts" />

var unirest = require('unirest');

import assert = require('power-assert');
import {HttpClient} from "../HttpClient";
import {UnirestHttpClient} from "../UnirestHttpClient";


describe('Unirest Http Client', function () {
    var client:HttpClient;

    before(function (done) {
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
                                    body: 'post body',
                                    headers: {headerTwo: 'valueTwo'}
                                }
                            }],
                            responses: [{is: {statusCode: 201, body: 'Post response'}}]
                        },
                        {
                            predicates: [{
                                equals: {
                                    method: 'PUT',
                                    body: 'put body',
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
            .end(function () {
                done();
            });
    });

    after(function (done) {
        unirest.delete('http://localhost:2525/imposters')
            .end(function () {
                done();
            });
    });

    it('should send a GET request', function (done) {
        client.get('http://localhost:4545', {headerOne: 'valueOne'}).then(function (resp) {
            assert.equal(resp.statusCode, 200);
            assert.equal(resp.body, 'Get response');
            done();
        });
    });

    it('should send a POST request', function (done) {
        client.post('http://localhost:4545', 'post body', {headerTwo: 'valueTwo'}).then(function (resp) {
            assert.equal(resp.statusCode, 201);
            assert.equal(resp.body, 'Post response');
            done();
        });
    });

    it('should send a PUT request', function (done) {
        client.put('http://localhost:4545', 'put body', {headerThree: 'valueThree'}).then(function (resp) {
            assert.equal(resp.statusCode, 202);
            assert.equal(resp.body, 'Put response');
            done();
        });
    });

    it('should send a HEAD request', function (done) {
        client.head('http://localhost:4545', {headerFour: 'valueFour'}).then(function (resp) {
            assert.equal(resp.statusCode, 203);
            done();
        });
    });

    it('should send a DELETE request', function (done) {
        client.delete('http://localhost:4545', {headerFive: 'valueFive'}).then(function (resp) {
            assert.equal(resp.statusCode, 204);
            done();
        });
    });

    ['get', 'post', 'put', 'delete', 'head'].forEach(function (entry) {
        it('should send ' + entry + ' requests without headers', function (done) {
            client[entry]('http://localhost:4545').then(function (resp) {
                assert.equal(resp.statusCode, 205);
                done();
            });
        });
    });
});
