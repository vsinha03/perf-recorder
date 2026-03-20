Feature: Application performance monitoring

  @google @perf
  Scenario: Google Page
    Given I open the "https://www.google.com/"
    When I wait for the page to fully load
    Then performance metrics are captured

  @amazon @perf
  Scenario: Amazon Page
    Given I open the "https://www.amazon.in/"
    When I wait for the page to fully load
    Then performance metrics are captured

  @mmt @perf
  Scenario: MMT Pro
    Given I open the "https://www.makemytrip.com/"
    When I wait for the page to fully load
    Then performance metrics are captured