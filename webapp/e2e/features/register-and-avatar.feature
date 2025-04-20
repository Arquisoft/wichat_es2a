Feature: Registering a new user with a custom avatar

Scenario: User is not registered in the site
  Given An unregistered user
  When I fill in the data in the form, edit my avatar, and press send.
  Then The user should be redirected to the Login page