Feature: Application performance monitoring

  @google @perf
  Scenario: Google Page
    Given I open the "https://www.google.com/"
    When I wait for the page to fully load
    Then performance metrics are captured

  @preqin @perf
  Scenario: Preqin Page
    Given I open the "https://www.preqin.com/"
    When I wait for the page to fully load
    Then performance metrics are captured

  @mmt @perf
  Scenario: MMT Page
    Given I open the "https://www.makemytrip.com/"
    When I wait for the page to fully load
    Then performance metrics are captured