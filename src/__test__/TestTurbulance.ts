import assert = require('power-assert');
import Q = require('q');
import {Turbulence} from '../Turbulence';
import {StubHttpClient} from './../Http/__test__/StubHttpClient';
import {HttpResponse} from '../Http/HttpResponse';
import {LocalExecutor} from '../Executors/LocalExecutor';
import {ToJsonFromJsonExecutor} from '../Executors/__test__/ToJsonFromJsonExecutor';
import {StubReportGenerator} from '../Reporters/__test__/StubReportGenerator';

Q.longStackSupport = true;

function isIstanbul() {
    return (() => {
            return null;
        }).toString().indexOf('cov') !== -1;
}

let types = [{Exec: LocalExecutor, name: 'Local'}, {Exec: ToJsonFromJsonExecutor, name: 'Distributed'}];

if (isIstanbul()) {
    types.pop(); // Removing ToJsonFromJsonExecutor - eval doesn't work correctly while coverage is being captured
}

types.map((type) => {
    describe(type.name + ' Turbulence', () => {
        let turbulence;
        let http;

        beforeEach(() => {
            http = new StubHttpClient();
            turbulence = new Turbulence(http, new type.Exec(), new StubReportGenerator());
        });

        describe('Running Tests', () => {
            it('should allow a http get request to be defined', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    key: 'value'
                }));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .endUserSteps()
                    .run();
            });

            it('should report no errors when the assertion passes', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    key: 'value'
                }));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .assertResponse((Response) => {
                        return Response.rawBody.key === 'value';
                    })
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(0, results.errors);
                    });
            });

            it('should report errors when the assertion fails', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    key: 'value'
                }));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .assertResponse((Response) => {
                        return Response.rawBody.key === 'wrong';
                    })
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(1, results.errors);
                    });
            });

            it('should report errors when http calls fail', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse(undefined, 400));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .expectStatus(200)
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(1, results.errors);
                    });
            });

            it('should pass when failure codes are expected', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse(undefined, 500));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .expectStatus(500)
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(0, results.errors);
                    });
            });

            it('should allow multiple assertions to be made', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first',
                    beta: 'second'
                }));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'second';
                    })
                    .assertResponse((Response) => {
                        return Response.rawBody.beta === 'second';
                    })
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(1, results.errors);
                    });
            });

            it('should count the number of failures', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first',
                    beta: 'second',
                    gamma: 'third'
                }));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'second';
                    })
                    .assertResponse((Response) => {
                        return Response.rawBody.beta === 'second';
                    })
                    .assertResponse((Response) => {
                        return Response.rawBody.gamma === 'second';
                    })
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(2, results.errors);
                    });
            });

            it('should allow multiple tests to be defined', () => {
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
                    });
            });

            it('should sum failures in final result', () => {
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
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'second';
                    })
                    .endUserSteps()

                    .startUserSteps()
                    .get('http://localhost:8080/url2')
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'second';
                    })
                    .endUserSteps()

                    .startUserSteps()
                    .get('http://localhost:8080/url3')
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'first';
                    })
                    .endUserSteps()

                    .run()
                    .then((results) => {
                        assert.equal(2, results.errors);
                    });
            });

            it('should allow multiple steps in a testPlans', () => {
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
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'second';
                    })
                    .get('http://localhost:8080/url2')
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'first';
                    })
                    .get('http://localhost:8080/url3')
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'first';
                    })
                    .endUserSteps()

                    .run()
                    .then((results) => {
                        assert.equal(2, results.errors);
                    });

            });

            it('should provide a processor step to do arbitrary computations', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    // tslint:disable-next-line:no-empty
                    .processor(() => {
                    })
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.ok(results !== null);
                    });
            });

            it('should provide a global scope object for storing variables between steps', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .processor((Global, Response) => {
                        Global.lastResponse = Response.rawBody;
                    })
                    .assertResponse((Global) => {
                        return Global.lastResponse.alpha === 'first';
                    })
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(0, results.errors);
                    });
            });

            it('should run the test to a specified time limit', function () {
                this.timeout(30000);

                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                let start = Date.now();

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'first';
                    })
                    .duration(1000)
                    .endUserSteps()

                    .run()
                    .then(() => {
                        let end = Date.now();

                        assert(end - start > 900, 'Expected duration greater than 900, was ' + (end - start));
                        assert(end - start < 1100, 'Expected duration greater than 900, was ' + (end - start));
                    });
            });

        });

        describe('Http options', () => {
            xit('should allow get requests', () => {
                return null;
            });

            it('should allow post requests', () => {
                http.whenPost('http://localhost:8080/url1', 'The Body').thenReturn(new HttpResponse(undefined, 200));

                return turbulence
                    .startUserSteps()
                    .post('http://localhost:8080/url1', 'The Body')
                    .expectStatus(200)
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(0, results.errors);
                    });
            });

            it('should allow put requests', () => {
                http.whenPut('http://localhost:8080/url1/1234', 'The Body')
                    .thenReturn(new HttpResponse(undefined, 200));

                return turbulence
                    .startUserSteps()
                    .put('http://localhost:8080/url1/1234', 'The Body')
                    .expectStatus(200)
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(0, results.errors);
                    });
            });

            it('should allow head requests', () => {
                http.whenHead('http://localhost:8080/url1/').thenReturn(new HttpResponse(undefined, 200));

                return turbulence
                    .startUserSteps()
                    .head('http://localhost:8080/url1/')
                    .expectStatus(200)
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(0, results.errors);
                    });
            });

            it('should allow delete requests', () => {
                http.whenDelete('http://localhost:8080/url1/1234').thenReturn(new HttpResponse(undefined, 200));

                return turbulence
                    .startUserSteps()
                    .delete('http://localhost:8080/url1/1234')
                    .expectStatus(200)
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        assert.equal(0, results.errors);
                    });
            });

            ['Get', 'Head', 'Delete'].forEach((entry) => {
                it('should allow headers to be passed for ' + entry, () => {
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
                        });
                });
            });

            ['Post', 'Put'].forEach((entry) => {
                it('should allow headers to be passed for ' + entry, () => {
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
                        });
                });
            });
        });

        describe('Assertions', () => {
            describe('body parsing', () => {
                it('should provide a raw response when given "Response"', () => {
                        http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse(JSON.stringify({
                            key: 'value'
                        })));

                        return turbulence
                            .startUserSteps()
                            .get('http://localhost:8080/url1')
                            .assertResponse((Response) => {
                                return Response.rawBody === JSON.stringify({key: 'value'});
                            })
                            .endUserSteps()
                            .run()
                            .then((results) => {
                                assert.equal(0, results.errors);
                            });
                    }
                )
                ;

                it('should parse json when given "JsonBody"', () => {
                        http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse(JSON.stringify({
                            key: 'value'
                        })));

                        return turbulence
                            .startUserSteps()
                            .get('http://localhost:8080/url1')
                            .assertResponse((JsonBody) => {
                                return JsonBody.key === 'value';
                            })
                            .endUserSteps()
                            .run()
                            .then((results) => {
                                assert.equal(0, results.errors);
                            });
                    }
                )
                ;

                it('should parse xml when given "XmlBody"', () => {
                        http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse('<a><b>asdf</b></a>'));

                        return turbulence
                            .startUserSteps()
                            .get('http://localhost:8080/url1')
                            .assertResponse((XmlBody) => {
                                return XmlBody.a.b === 'asdf';
                            })
                            .endUserSteps()
                            .run()
                            .then((results) => {
                                assert.equal(0, results.errors);
                            });
                    }
                )
                ;

                it('should inject nothing when no matching args are given', () => {
                    http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse('response body'));

                    return turbulence
                        .startUserSteps()
                        .get('http://localhost:8080/url1')
                        .assertResponse((body) => {
                            return body == null;
                        })
                        .endUserSteps()
                        .run()
                        .then((results) => {
                            assert.equal(0, results.errors);
                        });
                });

                it('should provide a jsonpath evaluator when given "JsonPath"', () => {
                        http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse(JSON.stringify({
                            key: 'value'
                        })));

                        return turbulence
                            .startUserSteps()
                            .get('http://localhost:8080/url1')
                            .assertResponse((JsonPath) => {
                                return JsonPath('$.key').pop() === 'value';
                            })
                            .endUserSteps()
                            .run()
                            .then((results) => {
                                assert.equal(0, results.errors);
                            });
                    }
                )
                ;

                xit('should provide an xpath evaluator when given "xpath"', () => {
                    return null;
                });

                it('should record an error if it cannot parse', () => {
                    http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse('Not valid json.'));

                    return turbulence
                        .startUserSteps()
                        .get('http://localhost:8080/url1')
                        .assertResponse((JsonBody) => {
                            return true;
                        })
                        .endUserSteps()
                        .run()
                        .then((results) => {
                            assert.equal(1, results.errors);
                        });
                });

                it('should inject arguments in order they are provided', () => {
                    http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse(JSON.stringify({
                        key: 'value'
                    })));

                    return turbulence
                        .startUserSteps()
                        .get('http://localhost:8080/url1')
                        .assertResponse((JsonBody, JsonPath) => {
                            return JsonBody.key === 'value' && JsonPath('$.key').pop() === 'value';
                        })
                        .endUserSteps()
                        .run()
                        .then((results) => {
                            assert.equal(0, results.errors);
                        });
                });
            });
        });

        describe('Control flow', () => {
            it('should allow pauses', () => {
                let start = new Date().getTime();

                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse());

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .pause(50)
                    .get('http://localhost:8080/url1')
                    .endUserSteps()
                    .run()
                    .then(() => {
                        let duration = new Date().getTime() - start;
                        assert(duration > 50, 'testPlans finished too quickly');
                        assert(duration < 100, 'testPlans took too long');
                    });
            });

            describe('if', () => {
                it('should allow an if statement to take the true branch', () => {
                    http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse(({
                        alpha: 'first'
                    })));

                    return turbulence
                        .startUserSteps()
                        .get('http://localhost:8080/url1')
                        .if((Response) => {
                            return Response.rawBody.alpha === 'first';
                        })
                        .get('http://localhost:8080/url1')
                        .endIf()
                        .endUserSteps()
                        .run()
                        .then((results) => {
                            assert.equal(2, results.requests.length);
                        });
                });

                it('should not allow an if statement to take the true branch if predicate is false', () => {
                    http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                        alpha: 'first'
                    }));

                    return turbulence
                        .startUserSteps()
                        .get('http://localhost:8080/url1')
                        .if((Response) => {
                            return Response.rawBody.alpha === 'second';
                        })
                        .get('http://localhost:8080/url1')
                        .endIf()
                        .endUserSteps()
                        .run()
                        .then((results) => {
                            assert.equal(1, results.requests.length);
                        });
                });

                it('should execute an else branch if the predicate is false', () => {
                    http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                        alpha: 'first'
                    }));

                    return turbulence
                        .startUserSteps()
                        .get('http://localhost:8080/url1')
                        .if((Response) => {
                            return Response.rawBody.alpha === 'second';
                        })
                        .get('http://localhost:8080/url2')
                        .else()
                        .get('http://localhost:8080/url1')
                        .endIf()
                        .endUserSteps()
                        .run()
                        .then((results) => {
                            assert.equal(2, results.requests.length);
                        });
                });

                xit('should execute an if else branch', () => {
                    return null;
                });

                xit('should evaluate multiple if else branches in order', () => {
                    return null;
                });
            });

            describe('loops', () => {
                it('should allow looping 1 time', () => {
                    http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                        alpha: 'first'
                    }), new HttpResponse({
                        alpha: 'second'
                    }));

                    return turbulence
                        .startUserSteps()
                        .loop(1)
                        .get('http://localhost:8080/url1')
                        .assertResponse((Response) => {
                            return Response.rawBody.alpha === 'first';
                        })
                        .endLoop()
                        .endUserSteps()
                        .run()
                        .then((results) => {
                            assert.equal(0, results.errors);
                        });
                });

                it('should allow looping 2 times', () => {
                    http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                        alpha: 'first'
                    }), new HttpResponse({
                        alpha: 'second'
                    }));

                    return turbulence
                        .startUserSteps()
                        .loop(2)
                        .get('http://localhost:8080/url1')
                        .assertResponse((Response) => {
                            return Response.rawBody.alpha === 'first';
                        })
                        .endLoop()
                        .endUserSteps()
                        .run()
                        .then((results) => {
                            assert.equal(1, results.errors);
                        });
                });

                it('should allow looping 3 times', () => {
                    http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                        alpha: 'first'
                    }), new HttpResponse({
                        alpha: 'second'
                    }));

                    return turbulence
                        .startUserSteps()
                        .loop(3)
                        .get('http://localhost:8080/url1')
                        .assertResponse((Response) => {
                            return Response.rawBody.alpha === 'first';
                        })
                        .endLoop()
                        .endUserSteps()
                        .run()
                        .then((results) => {
                            assert.equal(2, results.errors);
                        });
                });

                xit('should allow looping until a condition is satisfied', () => {
                    return null;
                });
            });
        });

        describe('Reporting', () => {
            it('should report a single http request result', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    key: 'value'
                })).delayResponse(10);

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .endUserSteps()
                    .run()
                    .then((results) => {
                        let request = results.requests.pop();
                        assert.equal('GET', request.type);
                        assert.equal('http://localhost:8080/url1', request.url);
                        assert.equal(200, request.status);
                        assert.equal(false, request.error);
                        assert(request.duration > 0, 'duration should be greater than 0');
                    });
            });

            it('should report average response time of http requests', () => {
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
                    });
            });
        });

        describe('Multi-User simulation', () => {
            it('should allow multiple users to be simulated', function () {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    key: 'value'
                }));

                let start = Date.now();

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .pause(1000)
                    .concurrentUsers(10)
                    .endUserSteps()
                    .run()
                    .then((report) => {
                        let end = Date.now();
                        let elapsed = end - start;

                        assert.equal(true, elapsed < 2000);
                        assert.equal(10, report.requests.length);
                    });
            });

            it('should allow a ramp-up period', function () {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                    key: 'value'
                }));

                let start = Date.now();

                return turbulence
                    .startUserSteps()
                    .get('http://localhost:8080/url1')
                    .concurrentUsers(10)
                    .rampUpPeriod(1000)
                    .endUserSteps()
                    .run()
                    .then((report) => {
                        assert(report.requests[0].timestamp - start < 100, 'Took too long to execute first request');

                        for (let i = 0; i < 9; i++) {
                            let current = report.requests[i];
                            let next = report.requests[i + 1];

                            let diff = next.timestamp - current.timestamp;

                            assert(diff > 50, 'diff should be greater than 50ms, was' + diff);
                            assert(diff < 200, 'diff should be less than 200ms, was ' + diff);
                        }
                    });
            });

            xit('should allow open workload testing', () => {
                return null;
            });

        });

        xdescribe('Distributed Testing', () => {
            xit('should send the test plan to the executor', () => {
                return null;
            });

            xit('should distribute the number of users equally between executors', () => {
                return null;
            });

        });

    });
});
