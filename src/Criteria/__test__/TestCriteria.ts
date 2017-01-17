import assert = require('power-assert');

import {Criteria} from '../Criteria';
import {SummaryResults} from '../../Results/SummaryResults';
import {HttpRequestRecord} from '../../Steps/Http/HttpRequestRecord';
import {HttpGetStep} from '../../Steps/Http/HttpGetStep';
import {HttpResponse} from '../../Http/HttpResponse';

describe('Criteria', () => {
    function getResultsWithAverageResponseTimeOf(averageResponseTime) {
        let summaryResults = new SummaryResults(null);
        let httpRequestRecord = new HttpRequestRecord(new HttpGetStep(null, null, null, null),
            new HttpResponse(null, 200), averageResponseTime, Date.now());
        summaryResults.requests.push(httpRequestRecord);
        return summaryResults;
    }

    describe('Average Response time', () => {
        describe('greaterThan', () => {
            it('should allow a greaterThan to be specified', () => {
                let criteria = new Criteria();
                criteria.averageResponseTime()
                    .greaterThan(50);

                let summaryResults = getResultsWithAverageResponseTimeOf(75);

                criteria.validate(summaryResults);
            });

            it('should fail if the average response time is less than the greaterThan', () => {
                let criteria = new Criteria();
                criteria.averageResponseTime()
                    .greaterThan(50);

                let summaryResults = getResultsWithAverageResponseTimeOf(25);

                try {
                    criteria.validate(summaryResults);
                    assert.ok(false);
                } catch (e) {
                    assert.ok('Average response time was less tahn 50 ms, failing the build', e.message);
                }
            });

            it('should immediately error if a lessThan is set lower than the greaterThan', () => {
                try {
                    new Criteria().averageResponseTime().greaterThan(100).lessThan(50);
                    assert.ok(false);
                } catch (e) {
                    assert.equal('Cannot set lessThan less than greaterThan', e.message);
                }
            });

            it('should immediately error if a greaterThan is set greater than the lessThan', () => {
                try {
                    new Criteria().averageResponseTime().lessThan(150).greaterThan(200);
                    assert.ok(false);
                } catch (e) {
                    assert.equal('Cannot set greaterThan greater than lessThan', e.message);
                }
            });
        });
    });
});
