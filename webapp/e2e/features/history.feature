Feature: View Game history  
 
  Scenario: View personal match history  
    Given Registered user login  
    When User navigates to the history page
    Then User sees a list of past games
