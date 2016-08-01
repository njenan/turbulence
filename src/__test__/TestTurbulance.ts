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

        xit('should provide a global scope object for storing variables between steps', () => {

        });

        it('should run the test to a specified time limit', function () {
            this.timeout(30000);

            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                alpha: 'first'
            }));

            var start = Date.now();

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
                    var end = Date.now();

                    assert(end - start > 900, 'Expected duration greater than 900, was ' + (end - start));
                    assert(end - start < 1100, 'Expected duration greater than 900, was ' + (end - start));
                });
        });

    });

    describe('Http options', () => {
        xit('should allow get requests', () => {

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
            http.whenPut('http://localhost:8080/url1/1234', 'The Body').thenReturn(new HttpResponse(undefined, 200));

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
            });

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
            });

            it('should parse xml when given "XmlBody"', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse("<a><b>asdf</b></a>"));

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
            });

            it('should inject nothing when no matching args are given', () => {
                http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse("response body"));

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
            });

            xit('should provide an xpath evaluator when given "xpath"', () => {

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

            });

            xit('should evaluate multiple if else branches in order', () => {

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
                    var request = results.requests.pop();
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

        it('should allow http requests to be labeled', () => {
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
                });
        });

        it('should generate an html report', () => {
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
                });
        });
    });

    describe('Multi-User simulation', () => {
        it('should allow multiple users to be simulated', function () {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            var start = Date.now();

            return turbulence
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
                });
        });

        it('should allow a ramp-up period', function () {
            http.whenGet('http://localhost:8080/url1').thenReturn(new HttpResponse({
                key: 'value'
            }));

            var start = Date.now();

            return turbulence
                .startUserSteps()
                .get('http://localhost:8080/url1')
                .concurrentUsers(10)
                .rampUpPeriod(1000)
                .endUserSteps()
                .run()
                .then((report) => {
                    assert(report.requests[0].timestamp - start < 100, 'Took too long to execute first request');

                    for (var i = 0; i < 9; i++) {
                        var current = report.requests[i];
                        var next = report.requests[i + 1];

                        var diff = next.timestamp - current.timestamp;

                        assert(diff > 50, 'diff should be greater than 50ms, was' + diff);
                        assert(diff < 200, 'diff should be less than 200ms, was ' + diff);
                    }
                });
        });

    });

    xdescribe('Distributed Testing', () => {
        xit('should send the test plan to the executor', () => {

        });

        xit('should distribute the number of users equally between executors', () => {

        });

    });

});