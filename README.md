# REPS
## Spaced Repetition Capstone Project


## Author

 Enrique Montemayor


## Live Application Link: 
[Reps] XXXXXXXXXX

## Summary:

This app is designed for optimal learning of the Spanish language using a spaced repetition algorithm. If you guess the translation of a given word correctly, you will be quizzed on it less often. Consecutive correct guess of a particular word will push that word further and further down the linked list.


Simply create an account and start learning!



## Client Repo: 
[Reps Client]XXXXXXX

## Server Repo:
[Reps Server]XXXXXX

### API Documentation:
GET /api/language
    returns the list of words for the given language

GET  /api/language/head
    returns: the next word the user will be quizzed on,                 
            the number of correct and incorrect guesses for the head word 
            the user's total score for that language

POST /api/language/guess
    returns: the correct answer,updated total score, the next word and its data, 

    "Memory value" is used to ensure that words that have been answered correctly multiple times are tested less frequently, while the correct and incorrect counts are the number of times the user has guessed correctly or incorrectly. "Next" points to the next word on the linked list.


### Screenshots
XXXXXX