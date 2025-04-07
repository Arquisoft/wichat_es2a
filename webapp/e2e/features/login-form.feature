Feature: Logging in to the application

Scenario: The user has an account and wants to log in
  Given A registered user
  When I fill the login credentials and press submit
  Then I should be logged in successfully