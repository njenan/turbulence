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
        let URL_1 = 'http://localhost:8080/url1';
        let URL_2 = 'http://localhost:8080/url2';

        let turbulence;
        let reporter;
        let http;

        beforeEach(() => {
            http = new StubHttpClient();
            reporter = new StubReportGenerator();
            turbulence = new Turbulence(http, new type.Exec(reporter), reporter);
        });

        describe('Running Tests', () => {
            it('should allow a http get request to be defined', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                }));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .endUserSteps()
                    .run();
            });

            it('should report no errors when the assertion passes', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                }));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .assertResponse((Response) => {
                        return Response.rawBody.key === 'value';
                    })
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(0, reporter.errors);
                    });
            });

            it('should report errors when the assertion fails', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                }));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .assertResponse((Response) => {
                        return Response.rawBody.key === 'wrong';
                    })
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(1, reporter.errors);
                    });
            });

            it('should report errors when http calls fail', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse(undefined, 400));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .expectStatus(200)
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(1, reporter.errors);
                    });
            });

            it('should pass when failure codes are expected', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse(undefined, 500));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .expectStatus(500)
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(0, reporter.errors);
                    });
            });

            it('should allow multiple assertions to be made', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    alpha: 'first',
                    beta: 'second'
                }));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'second';
                    })
                    .assertResponse((Response) => {
                        return Response.rawBody.beta === 'second';
                    })
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(1, reporter.errors);
                    });
            });

            it('should count the number of failures', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    alpha: 'first',
                    beta: 'second',
                    gamma: 'third'
                }));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
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
                    .then(() => {
                        assert.equal(2, reporter.errors);
                    });
            });

            it('should allow multiple tests to be defined', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse());
                http.whenGet(URL_2).thenReturn(new HttpResponse());

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .endUserSteps()

                    .startUserSteps()
                    .get(URL_2)
                    .endUserSteps()

                    .run()
                    .then(() => {
                        assert.equal(0, reporter.errors);
                    });
            });

            it('should sum failures in final result', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    alpha: 'first'
                }));
                http.whenGet(URL_2).thenReturn(new HttpResponse({
                    alpha: 'first'
                }));
                http.whenGet('http://localhost:8080/url3').thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'second';
                    })
                    .endUserSteps()

                    .startUserSteps()
                    .get(URL_2)
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
                    .then(() => {
                        assert.equal(2, reporter.errors);
                    });
            });

            it('should allow multiple steps in a testPlans', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    alpha: 'first'
                }));
                http.whenGet(URL_2).thenReturn(new HttpResponse({
                    alpha: 'second'
                }));
                http.whenGet('http://localhost:8080/url3').thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'second';
                    })
                    .get(URL_2)
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'first';
                    })
                    .get('http://localhost:8080/url3')
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'first';
                    })
                    .endUserSteps()

                    .run()
                    .then(() => {
                        assert.equal(2, reporter.errors);
                    });

            });

            it('should provide a processor step to do arbitrary computations', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    // tslint:disable-next-line:no-empty
                    .processor(() => {
                    })
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.ok(reporter.results !== null);
                    });
            });

            it('should provide a global scope object for storing variables between steps', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .processor((Global, Response) => {
                        Global.lastResponse = Response.rawBody;
                    })
                    .assertResponse((Global) => {
                        return Global.lastResponse.alpha === 'first';
                    })
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(0, reporter.errors);
                    });
            });

            // disabling linter because we need to set this.timeout()
            // tslint:disable-next-line:only-arrow-functions
            it('should run the test to a specified time limit', function () {
                this.timeout(30000);

                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    alpha: 'first'
                }));

                let start = Date.now();

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .assertResponse((Response) => {
                        return Response.rawBody.alpha === 'first';
                    })
                    .duration(1000)
                    .endUserSteps()

                    .run()
                    .then(() => {
                        let end = Date.now();

                        assert(end - start > 900, 'Expected duration greater than 900, was ' + (end - start));
                        assert(end - start < 1100, 'Expected duration less than 1100, was ' + (end - start));
                    });
            });
        });

        describe('Http options', () => {
            it('should allow get requests', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse(undefined, 201));

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .expectStatus(201)
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(0, reporter.errors);
                    });
            });

            it('should allow post requests', () => {
                http.whenPost(URL_1, 'The Body').thenReturn(new HttpResponse(undefined, 200));

                return turbulence
                    .startUserSteps()
                    .post(URL_1, 'The Body')
                    .expectStatus(200)
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(0, reporter.errors);
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
                    .then(() => {
                        assert.equal(0, reporter.errors);
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
                    .then(() => {
                        assert.equal(0, reporter.errors);
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
                    .then(() => {
                        assert.equal(0, reporter.errors);
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
                        .then(() => {
                            assert.equal(1, reporter.errors);
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
                        .then(() => {
                            assert.equal(1, reporter.errors);
                        });
                });
            });
        });

        describe('Assertions', () => {
            describe('body parsing', () => {
                it('should provide a raw response when given "Response"', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse(JSON.stringify({
                        key: 'value'
                    })));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .assertResponse((Response) => {
                            return Response.rawBody === JSON.stringify({key: 'value'});
                        })
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(0, reporter.errors);
                        });
                });

                it('should parse json when given "JsonBody"', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse(JSON.stringify({
                        key: 'value'
                    })));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .assertResponse((JsonBody) => {
                            return JsonBody.key === 'value';
                        })
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(0, reporter.errors);
                        });
                });

                it('should parse xml when given "XmlBody"', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse('<a><b>asdf</b></a>'));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .assertResponse((XmlBody) => {
                            return XmlBody.b === 'asdf';
                        })
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(0, reporter.errors);
                        });
                });

                it('should inject nothing when no matching args are given', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse('response body'));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .assertResponse((body) => {
                            return body == null;
                        })
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(0, reporter.errors);
                        });
                });

                it('should provide a jsonpath evaluator when given "JsonPath"', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse(JSON.stringify({
                        key: 'value'
                    })));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .assertResponse((JsonPath) => {
                            return JsonPath('$.key').pop() === 'value';
                        })
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(0, reporter.errors);
                        });
                });

                xit('should provide an xpath evaluator when given "xpath"', () => {
                    return null;
                });

                it('should record an error if it cannot parse', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse('Not valid json.'));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .assertResponse((JsonBody) => {
                            return true;
                        })
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(1, reporter.errors);
                        });
                });

                it('should inject arguments in order they are provided', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse(JSON.stringify({
                        key: 'value'
                    })));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .assertResponse((JsonBody, JsonPath) => {
                            return JsonBody.key === 'value' && JsonPath('$.key').pop() === 'value';
                        })
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(0, reporter.errors);
                        });
                });
            });
        });

        describe('Control flow', () => {
            it('should allow pauses', () => {
                let start = new Date().getTime();

                http.whenGet(URL_1).thenReturn(new HttpResponse());

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .pause(50)
                    .get(URL_1)
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
                    http.whenGet(URL_1).thenReturn(new HttpResponse(({
                        alpha: 'first'
                    })));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .if((Response) => {
                            return Response.rawBody.alpha === 'first';
                        })
                        .get(URL_1)
                        .endIf()
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(2, reporter.results.length);
                        });
                });

                it('should not allow an if statement to take the true branch if predicate is false', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse({
                        alpha: 'first'
                    }));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .if((Response) => {
                            return Response.rawBody.alpha === 'second';
                        })
                        .get(URL_1)
                        .endIf()
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(1, reporter.results.length);
                        });
                });

                it('should execute an else branch if the predicate is false', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse({
                        alpha: 'first'
                    }));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .if((Response) => {
                            return Response.rawBody.alpha === 'second';
                        })
                        .get(URL_2)
                        .else()
                        .get(URL_1)
                        .endIf()
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(2, reporter.results.length);
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
                    http.whenGet(URL_1).thenReturn(new HttpResponse({
                        alpha: 'first'
                    }), new HttpResponse({
                        alpha: 'second'
                    }));

                    return turbulence
                        .startUserSteps()
                        .loop(1)
                        .get(URL_1)
                        .assertResponse((Response) => {
                            return Response.rawBody.alpha === 'first';
                        })
                        .endLoop()
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(0, reporter.errors);
                        });
                });

                it('should allow looping 2 times', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse({
                        alpha: 'first'
                    }), new HttpResponse({
                        alpha: 'second'
                    }));

                    return turbulence
                        .startUserSteps()
                        .loop(2)
                        .get(URL_1)
                        .assertResponse((Response) => {
                            return Response.rawBody.alpha === 'first';
                        })
                        .endLoop()
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(1, reporter.errors);
                        });
                });

                it('should allow looping 3 times', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse({
                        alpha: 'first'
                    }), new HttpResponse({
                        alpha: 'second'
                    }));

                    return turbulence
                        .startUserSteps()
                        .loop(3)
                        .get(URL_1)
                        .assertResponse((Response) => {
                            return Response.rawBody.alpha === 'first';
                        })
                        .endLoop()
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(2, reporter.errors);
                        });
                });

                xit('should allow looping until a condition is satisfied', () => {
                    return null;
                });
            });
        });

        describe('Reporting', () => {
            it('should report a single http request result', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                })).delayResponse(10);

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .endUserSteps()
                    .run()
                    .then(() => {
                        let request = reporter.results.pop();
                        assert.equal('GET', request.type);
                        assert.equal(URL_1, request.url);
                        assert.equal(200, request.status);
                        assert.equal(false, request.error);
                        assert(request.duration > 0, 'duration should be greater than 0');
                    });
            });
        });

        describe('Multi-User simulation', () => {
            it('should allow multiple users to be simulated', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                }));

                let start = Date.now();

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .pause(100)
                    .concurrentUsers(10)
                    .endUserSteps()
                    .run()
                    .then(() => {
                        let end = Date.now();
                        let elapsed = end - start;

                        assert.equal(true, elapsed < 200);
                        assert.equal(10, reporter.results.length);
                    });
            });

            it('should allow a ramp-up period', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                }));

                let start = Date.now();

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .concurrentUsers(10)
                    .rampUpPeriod(1000)
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert(reporter.results[0].timestamp - start < 100, 'Took too long to execute first request');

                        for (let i = 0; i < 9; i++) {
                            let current = reporter.results[i];
                            let next = reporter.results[i + 1];

                            let diff = next.timestamp - current.timestamp;

                            assert(diff > 50, 'diff should be greater than 50ms, was' + diff);
                            assert(diff < 200, 'diff should be less than 200ms, was ' + diff);
                        }
                    });
            });

            describe('open workload testing', () => {
                it('should error if arrival rate is specified and no duration is specified', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse({
                        key: 'value'
                    }));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .arrivalRate(1)
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.ok(false);
                        }, (error) => {
                            assert.equal('Must specify a duration when arrival rate is specified.', error);
                        });
                });

                it('should error if arrival rate is specified and a number of users is specified', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse({
                        key: 'value'
                    }));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .arrivalRate(1)
                        .duration(1000)
                        .concurrentUsers(10)
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.ok(false);
                        }, (error) => {
                            assert.equal('A number of users cannot be specified when an arrival rate is specified.',
                                error);
                        });
                });

                it('should error if arrival rate is specified and a ramp up period is also specified', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse({
                        key: 'value'
                    }));

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .arrivalRate(1)
                        .duration(1000)
                        .rampUpPeriod(10)
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.ok(false);
                        }, (error) => {
                            assert.equal('A ramp up period cannot be specified when an arrival rate is specified.',
                                error);
                        });
                });

                it('should continue sending requests regardless of response times', () => {
                    http.whenGet(URL_1).thenReturn(new HttpResponse({
                        key: 'value'
                    })).delayResponse(500);

                    let start = Date.now();

                    return turbulence
                        .startUserSteps()
                        .get(URL_1)
                        .arrivalRate(100)
                        .duration(1000)
                        .endUserSteps()
                        .run()
                        .then(() => {
                            assert.equal(11, reporter.results.length);

                            assert.ok(reporter.results[0].timestamp - start >= 0);
                            assert.ok(reporter.results[1].timestamp - start >= 100);

                            assert.ok(reporter.results[10].timestamp - start >= 1000);
                        });
                });
            });

        });

        describe('Listeners', () => {
            it('should not report metrics when no listeners are added', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                })).delayResponse(500);

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(0, reporter.metrics.length);
                    });
            });

            it('should allow arbitrary samples to be added to the request logs', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                })).delayResponse(500);

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .listener({
                        interval: 100,
                        sample: () => {
                            return 'This is a sample';
                        }
                    })
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(1, reporter.metrics.length);
                    });
            });

            it('should allow listeners to sample at a set rate', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                })).delayResponse(500);

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .listener({
                        interval: 100,
                        sample: () => {
                            return 'This is a sample';
                        }
                    })
                    .duration(900)
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(10, reporter.metrics.length);
                    });
            });
        });

        describe('Build breakers', () => {
            it('should break the build if criteria are not met', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                })).delayResponse(100);

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .breaker((criteria) => {
                        criteria
                            .averageResponseTime()
                            .lessThan(50);
                    })
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.ok(false); // Fail the promise regardless so we hit our assertion in the catch block
                    })
                    .catch((error) => {
                        assert.equal('Average response time was greater than 50 ms, failing the build', error.message);
                        assert.equal(1, reporter.results.length);
                    });
            });

            it('should specify what the target criteria was', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                })).delayResponse(100);

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .breaker((criteria) => {
                        criteria
                            .averageResponseTime()
                            .lessThan(75);
                    })
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.ok(false); // Fail the promise regardless so we hit our assertion in the catch block
                    })
                    .catch((error) => {
                        assert.equal('Average response time was greater than 75 ms, failing the build', error.message);
                        assert.equal(1, reporter.results.length);
                    });
            });

            it('should not fail the build if the criteria are met', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                })).delayResponse(100);

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .breaker((criteria) => {
                        criteria
                            .averageResponseTime()
                            .lessThan(150);
                    })
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.equal(1, reporter.results.length);
                    });
            });

            it('should allow arbitrary functions to be used', () => {
                http.whenGet(URL_1).thenReturn(new HttpResponse({
                    key: 'value'
                })).delayResponse(100);

                return turbulence
                    .startUserSteps()
                    .get(URL_1)
                    .breaker((criteria) => {
                        criteria.predicate((results) => {
                            return results.length === 2;
                        });
                    })
                    .endUserSteps()
                    .run()
                    .then(() => {
                        assert.ok(false); // Fail the promise regardless so we hit our assertion in the catch block
                    })
                    .catch((error) => {
                        assert.equal('Predicate evaluated to false', error.message);
                        assert.equal(1, reporter.results.length);
                    });
            });
        });
    });
});
