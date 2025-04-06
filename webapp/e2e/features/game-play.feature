Feature: Play a full game

Scenario: User completes a game by answering all questions
  Given Registered user login
  When User choose category, press start button and play
  Then User sees the game summary