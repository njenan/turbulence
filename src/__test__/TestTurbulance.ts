/// <reference path="../../typings/main/ambient/q/index.d.ts" />
/// <reference path="../../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../../typings/main/ambient/assert/index.d.ts" />
/// <reference path="../../typings/main/ambient/xmldom/index.d.ts" />
/// <reference path="../../typings/main/ambient/xpath/index.d.ts" />

import assert = require('power-assert');
import Q = require('q');
import xpath = require('xpath');
import xmldom = require('xmldom');

import {Turbulence} from '../Turbulence';
import {StubHttp} from './../Http/__test__/StubHttp';
import {HttpResponse} from "../Http/HttpResponse";
import {LocalExecutor} from "../Executors/LocalExecutor";

Q.longStackSupport = true;

var domParser = new xmldom.DOMParser();

describe('Turbulence', function () {
    var turbulence;
    var http;

    beforeEach(function () {
        http = new StubHttp();
        turbulence = new Turbulence(http, new LocalExecutor());
    });

    describe('Running Tests', function () {

        it('should allow a http get request to be defined', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .endTest()
                .run()
                .then(function () {
                    done();
                });
        });

        it('should report no errors when the assertion passes', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .assertResponse(function (resp) {
                    return resp.body.key === 'value';
                })
                .endTest()
                .run()
                .then(function (results) {
                    assert.equal(0, results.errors);
                    done();
                });
        });

        it('should report errors when the assertion fails', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .assertResponse(function (resp) {
                    return resp.body.key === 'wrong';
                })
                .endTest()
                .run()
                .then(function (results) {
                    assert.equal(1, results.errors);
                    done();
                });
        });

        it('should report errors when http calls fail', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse(undefined, 400));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .expectStatus(200)
                .endTest()
                .run()
                .then(function (results) {
                    assert.equal(1, results.errors);
                    done();
                });
        });

        it('should pass when failure codes are expected', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse(undefined, 500));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .expectStatus(500)
                .endTest()
                .run()
                .then(function (results) {
                    assert.equal(0, results.errors);
                    done();
                });
        });

        it('should allow multiple assertions to be made', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                alpha: 'first',
                beta: 'second'
            }));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .assertResponse(function (resp) {
                    return resp.body.alpha === 'second';
                })
                .assertResponse(function (resp) {
                    return resp.body.beta === 'second';
                })
                .endTest()
                .run()
                .then(function (results) {
                    assert.equal(1, results.errors);
                    done();
                });
        });

        it('should count the number of failures', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                alpha: 'first',
                beta: 'second',
                gamma: 'third'
            }));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .assertResponse(function (resp) {
                    return resp.body.alpha === 'second';
                })
                .assertResponse(function (resp) {
                    return resp.body.beta === 'second';
                })
                .assertResponse(function (resp) {
                    return resp.body.gamma === 'second';
                })
                .endTest()
                .run()
                .then(function (results) {
                    assert.equal(2, results.errors);
                    done();
                });
        });

        it('should allow multiple tests to be defined', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse());
            http.whenGet('http://localhost:8080/url2').thenReturn(new HttpResponse());

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .endTest()

                .startTest()
                .get('http://localhost:8080/url2')
                .endTest()

                .run()
                .then(function (results) {
                    assert.equal(0, results.errors);
                    done();
                });
        });

        it('should sum failures in final result', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                alpha: 'first'
            }));
            http.whenGet('http://localhost:8080/url2').thenReturn(new HttpResponse({
                alpha: 'first'
            }));
            http.whenGet('http://localhost:8080/url3').thenReturn(new HttpResponse({
                alpha: 'first'
            }));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .assertResponse(function (resp) {
                    return resp.body.alpha === 'second';
                })
                .endTest()

                .startTest()
                .get('http://localhost:8080/url2')
                .assertResponse(function (resp) {
                    return resp.body.alpha === 'second';
                })
                .endTest()

                .startTest()
                .get('http://localhost:8080/url3')
                .assertResponse(function (resp) {
                    return resp.body.alpha === 'first';
                })
                .endTest()

                .run()
                .then(function (results) {
                    assert.equal(2, results.errors);
                    done();
                });
        });

        it('should allow multiple steps in a testPlans', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                alpha: 'first'
            }));
            http.whenGet('http://localhost:8080/url2').thenReturn(new HttpResponse({
                alpha: 'second'
            }));
            http.whenGet('http://localhost:8080/url3').thenReturn(new HttpResponse({
                alpha: 'first'
            }));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .assertResponse(function (resp) {
                    return resp.body.alpha === 'second';
                })
                .get('http://localhost:8080/url2')
                .assertResponse(function (resp) {
                    return resp.body.alpha === 'first';
                })
                .get('http://localhost:8080/url3')
                .assertResponse(function (resp) {
                    return resp.body.alpha === 'first';
                })
                .endTest()

                .run()
                .then(function (results) {
                    assert.equal(2, results.errors);
                    done();
                });

        });

        xit('should allow multiple users to run concurrently', function () {

        });

        xit('should provide a global scope object for storing variables between steps', function () {

        });

    });

    xdescribe('Http options', function () {
        it('should allow get requests', function () {

        });

        it('should allow post requests', function () {

        });

        it('should allow put requests', function () {

        });

        it('should allow head requests', function () {

        });

        it('should allow delete requests', function () {

        });
    });

    xdescribe('Assertions', function () {

    });

    describe('Control flow', function () {
        it('should allow pauses', function (done) {
            var start = new Date().getTime();

            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse());

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .pause(50)
                .get('http://localhost:8080/url1')
                .endTest()
                .run()
                .then(function () {
                    var duration = new Date().getTime() - start;
                    assert(duration > 50, 'testPlans finished too quickly');
                    assert(duration < 100, 'testPlans took too long');

                    done();
                });
        });

        describe('if', function () {
            it('should allow an if statement to take the true branch', function (done) {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startTest()
                    .get('http://localhost:8080/url1')
                    .if(function (resp) {
                        return resp.body.alpha === 'first';
                    })
                    .get('http://localhost:8080/url1')
                    .endIf()
                    .endTest()
                    .run()
                    .then(function (results) {
                        assert.equal(2, results.requests.length);
                        done();
                    });
            });

            it('should not allow an if statement to take the true branch if predicate is false', function (done) {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startTest()
                    .get('http://localhost:8080/url1')
                    .if(function (resp) {
                        return resp.body.alpha === 'second';
                    })
                    .get('http://localhost:8080/url1')
                    .endIf()
                    .endTest()
                    .run()
                    .then(function (results) {
                        assert.equal(1, results.requests.length);
                        done();
                    });
            });

            it('should execute an else branch if the predicate is false', function (done) {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startTest()
                    .get('http://localhost:8080/url1')
                    .if(function (resp) {
                        return resp.body.alpha === 'second';
                    })
                    .get('http://localhost:8080/url2')
                    .else()
                    .get('http://localhost:8080/url1')
                    .endIf()
                    .endTest()
                    .run()
                    .then(function (results) {
                        assert.equal(2, results.requests.length);
                        done();
                    }).catch(function (err) {
                        console.error(err);
                    });
            });

            xit('should execute an if else branch', function () {

            });

            xit('should evaluate multiple if else branches in order', function () {

            });
        });

        describe('loops', function () {
            it('should allow looping 1 time', function (done) {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }), new HttpResponse({
                    alpha: 'second'
                }));

                return turbulence
                    .startTest()
                    .loop(1)
                    .get('http://localhost:8080/url1')
                    .assertResponse(function (resp) {
                        return resp.body.alpha === 'first';
                    })
                    .endLoop()
                    .endTest()
                    .run()
                    .then(function (results) {
                        assert.equal(0, results.errors);
                        done();
                    });
            });

            it('should allow looping 2 times', function (done) {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }), new HttpResponse({
                    alpha: 'second'
                }));

                return turbulence
                    .startTest()
                    .loop(2)
                    .get('http://localhost:8080/url1')
                    .assertResponse(function (resp) {
                        return resp.body.alpha === 'first';
                    })
                    .endLoop()
                    .endTest()
                    .run()
                    .then(function (results) {
                        assert.equal(1, results.errors);
                        done();
                    });
            });

            it('should allow looping 3 times', function (done) {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }), new HttpResponse({
                    alpha: 'second'
                }));

                return turbulence
                    .startTest()
                    .loop(3)
                    .get('http://localhost:8080/url1')
                    .assertResponse(function (resp) {
                        return resp.body.alpha === 'first';
                    })
                    .endLoop()
                    .endTest()
                    .run()
                    .then(function (results) {
                        assert.equal(2, results.errors);
                        done();
                    });
            });

            xit('should allow looping until a condition is satisfied', function () {

            });
        });
    });

    describe('Reporting', function () {
        it('should report a single http request result', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .endTest()
                .run()
                .then(function (results) {
                    var request = results.requests.pop();
                    assert.equal('GET', request.type);
                    assert.equal('http://localhost:8080/url1', request.url);
                    assert.equal(200, request.status);
                    assert.equal(false, request.error);
                    assert(request.duration > 0, 'duration should be greater than 0');
                    done();
                });
        });

        it('should report average response time of http requests', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .endTest()
                .run()
                .then(function (results) {
                    assert(results.averageResponseTime() || results.averageResponseTime() === 0);
                    done();
                });
        });

        it('should generate an html report', function (done) {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            return turbulence
                .startTest()
                .get('http://localhost:8080/url1')
                .endTest()
                .run()
                .report()
                .then(function (report) {
                    var doc = domParser.parseFromString(report);
                    assert.equal('Total Requests: 1', xpath.select('//*[@class="TotalRequests"]', doc)[0].firstChild.data);

                    done();
                });
        });
    });

    xdescribe('Distributed Testing', function () {
        xit('should send the test plan to the executor', function () {

        });

        xit('should distribute the number of users equally between executors', function () {

        });
    });

    xdescribe('CLI', function () {
        it('should run the specified .js file', function () {

        });

        it('should all .js files when given no args', function () {

        });

        it('should allow patterns to be included', function () {

        });

        it('should allow patterns to be excluded', function () {

        });
    });
});
