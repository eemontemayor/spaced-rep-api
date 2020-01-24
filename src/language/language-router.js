const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('../linked-list/list')
const {ListService, buildList}=require('../linked-list/list-service')
const jsonBodyParser = express.json()
const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

  languageRouter
  .get('/head', async (req, res, next) => {
    try {

      const word = await LanguageService.getHeadWord(
        req.app.get('db'),
        req.user.id,
      );

      const score = await LanguageService.getTotalScore(
        req.app.get('db'),
        req.user.id,
      );
      
      res.status(200).json({
        nextWord: word[0].original,
        totalScore: score[0].total_score,
        wordCorrectCount: word[0].correct_count,
        wordIncorrectCount: word[0].incorrect_count 
      })
      next()
    } catch (error) {
      next(error)
    }
  });

languageRouter
  .post('/guess',jsonBodyParser, async (req, res, next) => {
    const { guess } = req.body
   
    try {

      ////checking for guess in req
      if (!guess)
      return res.status(400).json({
        error: `Missing 'guess' in request body`,
      })
      ///////////////////

      let head = await LanguageService.getHeadWord(
        req.app.get('db'),
        req.user.id,
      );

      let words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        head[0].language_id
      );
      let totalScore = await LanguageService.getTotalScore(
        req.app.get('db'),
        req.user.id,
      );



             // finding the next head in words with nextHeadId
      const nextHeadId = head[0].next
    
      const nextHead = words.filter(word => word.id === nextHeadId)
  


      let LL = new LinkedList;
      buildList(LL, head[0], words)
      console.log('============BEFORE=====================', totalScore)
      ListService.displayList(LL)
      

      //correct answer
      // const correct = head[0].translation

      //declaring variables for guess check and later response
    


            
    let resObj = {

      answer:head[0].translation
    }  
      let headWordUpdate = {
        memory_value : head[0].memory_value,
        correct_count: head[0].correct_count,
        incorrect_count : head[0].incorrect_count
     }
      let prevWordUpdate = {
      
      }
      let langTableUpdate = {
        head: nextHeadId,
        total_score:totalScore[0].total_score
      }
    
     

     
    if(guess === head[0].translation){  
        
      resObj.isCorrect=true
     langTableUpdate.total_score += 1;

      headWordUpdate.memory_value *= 2;
      headWordUpdate.correct_count += 1;
    

    } else{
      resObj.isCorrect=false;
  

      headWordUpdate.memory_value = 1;
      headWordUpdate.incorrect_count += 1;


    }

      
      LL.remove(head[0])
      LL.insertAt(head[0].memory_value, head[0])
      
      // find prev word after moving oldHead down the list (to update next id #)
      let prevWordNode = ListService.findPrevious(LL, head[0])
      
      //find out new .next value of oldHead
      headWordUpdate.next = prevWordNode.value.next
      
      prevWordUpdate.next = head[0].id

   




      // update language table (points to new head id # and totalScore)
    await  LanguageService.updateUserLanguage(
        req.app.get('db'),
      req.user.id, 
        langTableUpdate
      )

      //update word table (updates in/correct_count and next id # on word just guessed on)
     await LanguageService.updateWordById(
        req.app.get('db'),
        head[0].id,
        headWordUpdate
      )

      
// update prevWord (updates next id # to point to old head)      
     await LanguageService.updateWordById(
        req.app.get('db'),
        prevWordNode.value.id,
        prevWordUpdate
      )

//get new head (original word correct count and incorrect count)
const word = await LanguageService.getHeadWord(
  req.app.get('db'),
  req.user.id,
);

const score = await LanguageService.getTotalScore(
  req.app.get('db'),
  req.user.id,
);

res.status(200).json({
  nextWord: word[0].original,
  totalScore: score[0].total_score,
  wordCorrectCount: word[0].correct_count,
  wordIncorrectCount: word[0].incorrect_count ,
  answer:resObj.answer,
  isCorrect:resObj.isCorrect,
})
      

     next()
    } catch (error) {
     next(error)
    }
  })

module.exports = languageRouter
