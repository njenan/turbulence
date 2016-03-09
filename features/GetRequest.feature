Feature: Get Request
  As a performance tester
  I want to make get requests
  So that I can performance tests my applications

  Scenario: Single Get Request
    Given a test makes a GET request to a url
    When I run the test
    Then a get request will have been made to the url

   Scenario:
     Given a test makes multiple GET requests
     When I run the tests
     Then the get requests will be made in order