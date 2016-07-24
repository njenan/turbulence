/// <reference path="../../typings/main/ambient/q/index.d.ts" />
/// <reference path="../../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../../typings/main/ambient/assert/index.d.ts" />
/// <reference path="../../typings/main/ambient/xmldom/index.d.ts" />
/// <reference path="../../typings/main/ambient/xpath/index.d.ts" />

import assert = require('power-assert');
import Q = require('q');
import xpath = require('xpath');
import xmldom = require('xmldom');
import child_process = require('child_process');

import {Turbulence} from '../Turbulence';
import {StubHttpClient} from './../Http/__test__/StubHttpClient';
import {HttpResponse} from "../Http/HttpResponse";
import {LocalExecutor} from "../Executors/LocalExecutor";
import {JadeHtmlReportGenerator} from "../Reporters/JadeHtmlReportGenerator";
import {StubFs} from "../Reporters/__test__/StubFs";

Q.longStackSupport = true;

var domParser = new xmldom.DOMParser({
    errorHandler: {
        warning: () => {
        }, error: () => {
        }, fatalError: () => {
        }
    }
});


describe('Turbulence', () => {
    var turbulence;
    var http;
    var stubFs;

    beforeEach(() => {
        stubFs = new StubFs();
        http = new StubHttpClient();
        turbulence = new Turbulence(http, new LocalExecutor(), new JadeHtmlReportGenerator(stubFs));
    });

    describe('Running Tests', () => {

        it('should allow a http get request to be defined', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .endUserSteps()
                .run()
                .then(() => {
                    done();
                });
        });

        it('should report no errors when the assertion passes', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .assertResponse((resp) => {
                    return resp.body.key === 'value';
                })
                .endUserSteps()
                .run()
                .then((results) => {
                    assert.equal(0, results.errors);
                    done();
                }).catch((err) => {
                    console.error(err);
                });
        });

        it('should report errors when the assertion fails', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .assertResponse((resp) => {
                    return resp.body.key === 'wrong';
                })
                .endUserSteps()
                .run()
                .then((results) => {
                    assert.equal(1, results.errors);
                    done();
                });
        });

        it('should report errors when http calls fail', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse(undefined, 400));

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .expectStatus(200)
                .endUserSteps()
                .run()
                .then((results) => {
                    assert.equal(1, results.errors);
                    done();
                });
        });

        it('should pass when failure codes are expected', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse(undefined, 500));

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .expectStatus(500)
                .endUserSteps()
                .run()
                .then((results) => {
                    assert.equal(0, results.errors);
                    done();
                });
        });

        it('should allow multiple assertions to be made', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                alpha: 'first',
                beta: 'second'
            }));

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .assertResponse((resp) => {
                    return resp.body.alpha === 'second';
                })
                .assertResponse((resp) => {
                    return resp.body.beta === 'second';
                })
                .endUserSteps()
                .run()
                .then((results) => {
                    assert.equal(1, results.errors);
                    done();
                });
        });

        it('should count the number of failures', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                alpha: 'first',
                beta: 'second',
                gamma: 'third'
            }));

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .assertResponse((resp) => {
                    return resp.body.alpha === 'second';
                })
                .assertResponse((resp) => {
                    return resp.body.beta === 'second';
                })
                .assertResponse((resp) => {
                    return resp.body.gamma === 'second';
                })
                .endUserSteps()
                .run()
                .then((results) => {
                    assert.equal(2, results.errors);
                    done();
                });
        });

        it('should allow multiple tests to be defined', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse());
            http.whenGet('http://localhost:8080/url2').thenReturn(new HttpResponse());

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .endUserSteps()

                .startUserSteps()
                .get('http://localhost:8080/url2')
                .endUserSteps()

                .run()
                .then((results) => {
                    assert.equal(0, results.errors);
                    done();
                });
        });

        it('should sum failures in final result', (done) => {
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
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .assertResponse((resp) => {
                    return resp.body.alpha === 'second';
                })
                .endUserSteps()

                .startUserSteps()
                .get('http://localhost:8080/url2')
                .assertResponse((resp) => {
                    return resp.body.alpha === 'second';
                })
                .endUserSteps()

                .startUserSteps()
                .get('http://localhost:8080/url3')
                .assertResponse((resp) => {
                    return resp.body.alpha === 'first';
                })
                .endUserSteps()

                .run()
                .then((results) => {
                    assert.equal(2, results.errors);
                    done();
                });
        });

        it('should allow multiple steps in a testPlans', (done) => {
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
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .assertResponse((resp) => {
                    return resp.body.alpha === 'second';
                })
                .get('http://localhost:8080/url2')
                .assertResponse((resp) => {
                    return resp.body.alpha === 'first';
                })
                .get('http://localhost:8080/url3')
                .assertResponse((resp) => {
                    return resp.body.alpha === 'first';
                })
                .endUserSteps()

                .run()
                .then((results) => {
                    assert.equal(2, results.errors);
                    done();
                });

        });

        xit('should allow multiple users to run concurrently', () => {

        });

        xit('should provide a global scope object for storing variables between steps', () => {

        });

    });

    describe('Http options', () => {
        xit('should allow get requests', () => {

        });

        it('should allow post requests', (done) => {
            http.whenPost('http://localhost:8080/url1', 'The Body').thenReturn(new HttpResponse(undefined, 200));

            return turbulence
                .startUserSteps()
                .post('http://localhost:8080/url1', 'The Body')
                .expectStatus(200)
                .endUserSteps()
                .run()
                .then((results) => {
                    assert.equal(0, results.errors);
                    done();
                });
        });

        it('should allow put requests', (done) => {
            http.whenPut('http://localhost:8080/url1/1234', 'The Body').thenReturn(new HttpResponse(undefined, 200));

            return turbulence
                .startUserSteps()
                .put('http://localhost:8080/url1/1234', 'The Body')
                .expectStatus(200)
                .endUserSteps()
                .run()
                .then((results) => {
                    assert.equal(0, results.errors);
                    done();
                });
        });

        it('should allow head requests', (done) => {
            http.whenHead('http://localhost:8080/url1/').thenReturn(new HttpResponse(undefined, 200));

            return turbulence
                .startUserSteps()
                .head('http://localhost:8080/url1/')
                .expectStatus(200)
                .endUserSteps()
                .run()
                .then((results) => {
                    assert.equal(0, results.errors);
                    done();
                });
        });

        it('should allow delete requests', (done) => {
            http.whenDelete('http://localhost:8080/url1/1234').thenReturn(new HttpResponse(undefined, 200));

            return turbulence
                .startUserSteps()
                .delete('http://localhost:8080/url1/1234')
                .expectStatus(200)
                .endUserSteps()
                .run()
                .then((results) => {
                    assert.equal(0, results.errors);
                    done();
                });
        });

        ['Get', 'Head', 'Delete'].forEach((entry) => {
            it('should allow headers to be passed for ' + entry, (done) => {
                http['when' + entry]('http://localhost:8080/url1/1234', {
                    headers: {
                        header1: 'value1',
                        header2: 'value2'
                    }
                }).thenReturn(new HttpResponse(undefined, 200));

                return turbulence
                    .startUserSteps()
                    [entry.toLowerCase()]('http://localhost:8080/url1/1234', {header1: 'value1', header2: 'value2'})
                    .expectStatus(200)
                    [entry.toLowerCase()]('http://localhost:8080/url1/1234', {header1: 'value1', header2: 'value1'})
                    .expectStatus(200)
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(1, results.errors);
                        done();
                    });
            });
        });

        ['Post', 'Put'].forEach((entry) => {
            it('should allow headers to be passed for ' + entry, (done) => {
                http['when' + entry]('http://localhost:8080/url1/1234', 'the body', {
                    headers: {
                        header1: 'value1',
                        header2: 'value2'
                    }
                }).thenReturn(new HttpResponse(undefined, 200));

                return turbulence
                    .startUserSteps()
                    [entry.toLowerCase()]('http://localhost:8080/url1/1234', 'the body', {
                    header1: 'value1',
                    header2: 'value2'
                })
                    .expectStatus(200)
                    [entry.toLowerCase()]('http://localhost:8080/url1/1234', 'the body', {
                    header1: 'value1',
                    header2: 'value1'
                })
                    .expectStatus(200)
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(1, results.errors);
                        done();
                    }).catch((err) => {
                        console.error(err);
                    });
            });
        });
    });

    xdescribe('Assertions', () => {

    });

    describe('Control flow', () => {
        it('should allow pauses', (done) => {
            var start = new Date().getTime();

            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse());

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .pause(50)
                .get('http://localhost:8080/url1')
                .endUserSteps()
                .run()
                .then(() => {
                    var duration = new Date().getTime() - start;
                    assert(duration > 50, 'testPlans finished too quickly');
                    assert(duration < 100, 'testPlans took too long');

                    done();
                });
        });

        describe('if', () => {
            it('should allow an if statement to take the true branch', (done) => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .if((resp) => {
                        return resp.body.alpha === 'first';
                    })
                    .get('http://localhost:8080/url1')
                    .endIf()
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(2, results.requests.length);
                        done();
                    });
            });

            it('should not allow an if statement to take the true branch if predicate is false', (done) => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .if((resp) => {
                        return resp.body.alpha === 'second';
                    })
                    .get('http://localhost:8080/url1')
                    .endIf()
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(1, results.requests.length);
                        done();
                    });
            });

            it('should execute an else branch if the predicate is false', (done) => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .if((resp) => {
                        return resp.body.alpha === 'second';
                    })
                    .get('http://localhost:8080/url2')
                    .else()
                    .get('http://localhost:8080/url1')
                    .endIf()
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(2, results.requests.length);
                        done();
                    }).catch((err) => {
                        console.error(err);
                    });
            });

            xit('should execute an if else branch', () => {

            });

            xit('should evaluate multiple if else branches in order', () => {

            });
        });

        describe('loops', () => {
            it('should allow looping 1 time', (done) => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }), new HttpResponse({
                    alpha: 'second'
                }));

                return turbulence
                    .startUserSteps()
                    .loop(1)
                    .get('http://localhost:8080/url1')
                    .assertResponse((resp) => {
                        return resp.body.alpha === 'first';
                    })
                    .endLoop()
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(0, results.errors);
                        done();
                    });
            });

            it('should allow looping 2 times', (done) => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }), new HttpResponse({
                    alpha: 'second'
                }));

                return turbulence
                    .startUserSteps()
                    .loop(2)
                    .get('http://localhost:8080/url1')
                    .assertResponse((resp) => {
                        return resp.body.alpha === 'first';
                    })
                    .endLoop()
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(1, results.errors);
                        done();
                    });
            });

            it('should allow looping 3 times', (done) => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }), new HttpResponse({
                    alpha: 'second'
                }));

                return turbulence
                    .startUserSteps()
                    .loop(3)
                    .get('http://localhost:8080/url1')
                    .assertResponse((resp) => {
                        return resp.body.alpha === 'first';
                    })
                    .endLoop()
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(2, results.errors);
                        done();
                    });
            });

            xit('should allow looping until a condition is satisfied', () => {

            });
        });
    });

    describe('Reporting', () => {
        it('should report a single http request result', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            })).delayResponse(10);

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .endUserSteps()
                .run()
                .then((results) => {
                    var request = results.requests.pop();
                    assert.equal('GET', request.type);
                    assert.equal('http://localhost:8080/url1', request.url);
                    assert.equal(200, request.status);
                    assert.equal(false, request.error);
                    assert(request.duration > 0, 'duration should be greater than 0');
                    done();
                }).catch((err) => {
                    console.error(err);
                });
        });

        it('should report average response time of http requests', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            })).delayResponse(10);

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .endUserSteps()
                .run()
                .then((results) => {
                    assert(results.averageResponseTime());
                    done();
                });
        });

        it('should allow http requests to be labeled', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            })).delayResponse(10);

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1', undefined, 'Retrieve User Information')
                .endUserSteps()
                .run()
                .report()
                .then(() => {
                    var doc = domParser.parseFromString(stubFs.data);
                    assert.equal('Retrieve User Information', xpath.select('//*[@class="Name"]', doc)[0].firstChild.data);

                    done();
                });
        });

        it('should generate an html report', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .endUserSteps()
                .run()
                .report()
                .then(() => {
                    var doc = domParser.parseFromString(stubFs.data);
                    assert.equal('1', xpath.select('//*[@class="TotalRequests"]', doc)[0].firstChild.data);

                    done();
                });
        });
    });

    describe('Multi-User simulation', () => {
        it('should allow multiple users to be simulated', (done) => {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            var start = Date.now();

            turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .pause(1000)
                .concurrentUsers(10)
                .endUserSteps()
                .run()
                .then((report) => {
                    var end = Date.now();

                    var elapsed = end - start;

                    assert.equal(true, elapsed < 2000);
                    assert.equal(10, report.requests.length);
                    done();
                });
        });
    });

    xdescribe('Distributed Testing', () => {
        xit('should send the test plan to the executor', () => {

        });

        xit('should distribute the number of users equally between executors', () => {

        });
    });


})
;
