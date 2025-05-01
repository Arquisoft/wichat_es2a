Feature: Log out of the current account 

Scenario: User logs in with his account and logs out
  Given User in home view
  When User selects the logout button
  Then User logs out and sees the login view