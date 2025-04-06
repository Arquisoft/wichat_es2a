Feature: Choose a category for game

Scenario: User choose a category and start game
  Given Registered user login
  When User choose category and press start button
  Then Game start in this category