var Turbulence = require('../../src/Turbulence');
var StubHttp = require('./StubHttp');

var assert = require('assert');

module.exports = function () {
    var turbulence;
    var stubHttp;

    this.Before(function () {
        stubHttp = new StubHttp();
        turbulence = new Turbulence(stubHttp);
    });

    this.Given(/^a test makes a GET request to a url$/, function () {
        turbulence
            .startTest()
            .get('http://localhost:8080/testurl')
            .endTest();
    });

    this.Given(/^a test makes multiple GET requests$/, function () {
        stubHttp.whenGet('http://localhost:8080/testurl').thenReturn(200, {});

        turbulence
            .startTest()
            .get('http://localhost:8080/testurl')
            .get('http://localhost:8080/testurl')
            .endTest();
    });

    this.When(/^I run the test(|s)$/, function (a) {
        assert.equal(false, turbulence.status.inProgress);
        turbulence.run();
        assert.equal(true, turbulence.status.inProgress);
    });

    this.Then(/^a get request will have been made to the url$/, function () {
        assert.equal(true, turbulence.status.inProgress);
        stubHttp.triggerOneHttpResponse();
        assert.equal(1, stubHttp.invocations['http://localhost:8080/testurl'].count);
    });

    this.Then(/^the get requests will be made in order$/, function () {

    });
};
