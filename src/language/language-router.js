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
        // translation:word[0].translation,
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
      console.log('============BEFORE=====================')
      ListService.displayList(LL)
      

      //correct answer
      // const correct = head[0].translation

      //declaring variables for guess check and later response
    


            
    let resObj = {

      answer:head[0].translation
    }  
      let headWordUpdate = {
       
     }
      let prevWordUpdate = {
      
    }
    
     

     
    if(guess === head[0].translation){  
        
      resObj.isCorrect=true
      totalScore += 1;

      headWordUpdate.memory_value = head[0].memory_value *= 2;
      headWordUpdate.correct_count= head[0].correct_count += 1;
      // headWordUpdate.next = 

    } else{
      resObj.isCorrect=false;
  

      headWordUpdate.memory_value = head[0].memory_value = 1;
      headWordUpdate.incorrect_count = head[0].incorrect_count += 1;
      // headWordUpdate.next = 

    }

      
      LL.remove(head[0])
      LL.insertAt(head[0].memory_value, head[0])
      //find out new .next value of oldHead
      // find prev word after moving oldHead down the list (to update next id #)
    
      let prevWordNode = ListService.findPrevious(LL, head[0])
      
      headWordUpdate.next = prevWordNode.value.next

      prevWordUpdate.next = head[0].id

      console.log('============AFTER=====================')   
      console.log(prevWordUpdate,'------------------------------------------') 
      console.log(headWordUpdate)
      ListService.displayList(LL)


      // update language table (points to new head id # and totalScore)
      // LanguageService.updateUserLanguage(
      //   req.app.get('db'),
      //   req.user.id,
      //   nextHeadId,
      //   totalScore
      // )

      //update word table (updates in/correct_count and next id # on word just guessed on)
      // LanguageService.updateWordById(
      //   req.app.get('db'),
      //   head[0].id,
      //   headWordUpdate
      // )

      
// update prevWord (updates next id # to point to old head)      
      // LanguageService.updateWordById(
      //   req.app.get('db'),
      //   prevWordNode.value.id,
      //   prevWordUpdate
      // )

//get new head (original word correct count and incorrect count)

      response = {
        // nextWord:newHead.original,
        // wordCorrectCount:newHead.correct_count,
        // wordIncorrectCount:newHead.incorrect_count,
        answer:resObj.answer,
        isCorrect:resObj.isCorrect,
        totalScore:Number(totalScore),
      }
      res.status(200).json(response)

     next()
    } catch (error) {
     next(error)
    }
  })

module.exports = languageRouter
