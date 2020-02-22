const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('../linked-list/list')
const xss = require('xss')
const {ListService, buildList}=require('../linked-list/list-service')
const jsonBodyParser = express.json()
const languageRouter = express.Router()


const serializeWord = word => ({
  id: word.id,
  original: xss(word.original),
  translation:xss(word.translation),
  memory_value: word.memory_value,
  correct_count: word.correct_count,
  incorrect_count: word.incorrect_count,
  language_id:word.language_id,
  next: word.next,
  

})


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
  .get('/word/:word_id', async (req, res, next) => {
    
    try {
      
      let word = await LanguageService.getWordById(
        req.app.get('db'),
        req.params.word_id
      )
      word = word[0]
      res.status(200).json({
        word
      })
      next()
    } catch (error) {
      next(error)
    }
  });


languageRouter
.delete('/word/:word_id',async (req, res, next) => {
    
  try {

    let head = await LanguageService.getHeadWord(
      req.app.get('db'),
      req.user.id,
    );

    let wordToDelete = await LanguageService.getWordById(
      req.app.get('db'),
      req.params.word_id,
    )


    
    // if word to delete is head word: 
    if (wordToDelete[0].id === head[0].id) {

      let langTableUpdate={}
      langTableUpdate.head = wordToDelete[0].next

      await  LanguageService.updateUserLanguage(
        req.app.get('db'),
        req.user.id, 
        langTableUpdate
      )
      
    } else {

      let prevWordUpdate = {
        next : wordToDelete[0].next
      }

      await LanguageService.updateWordByNextId(
        req.app.get('db'),
        req.params.word_id,
        prevWordUpdate
      )
      
    }
    
    if (wordToDelete[0].correct_count > 0) {
      let score = await LanguageService.getTotalScore(
        req.app.get('db'),
        req.user.id,
      );
        let totalScore = score[0].total_score
            totalScore = totalScore - wordToDelete[0].correct_count
      let totalScoreUpdate = {
          total_score : totalScore
      }
      await  LanguageService.updateUserLanguage(
        req.app.get('db'),
        req.user.id, 
        totalScoreUpdate
      )
    }



    //remove word from database
    await LanguageService.deleteWordById(
      req.app.get('db'),
      wordToDelete[0].id
    )

    res.status(204).end()
    next()
  } catch (error) {
    next(error)
  }
    })
      




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
    

  


      let LL = new LinkedList;
      buildList(LL, head[0], words)
   
      // console.log('^^^^^^^^^^^^^^^^^^^^^  BEFORE   ^^^^^^^^^^^^^^^^^^^^^^')
      // ListService.displayList(LL)
      
    

            
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


      
      headWordUpdate.memory_value *= 2 ;
      headWordUpdate.correct_count += 1;


    } else{
      resObj.isCorrect=false;
  

      headWordUpdate.memory_value = 1;
      headWordUpdate.incorrect_count += 1;


    }

    
    let listSize = await ListService.size(LL)
    LL.remove(head[0])

      
      if (headWordUpdate.memory_value >= listSize-1) {
        LL.insertLast(head[0])
      } else {
       
        LL.insertAt(headWordUpdate.memory_value, head[0])
      }
      
      // find prev word after moving oldHead down the list (to update next id #)
      let prevWordNode = ListService.findPrevious(LL, head[0])
      
      //find out new .next value of oldHead
      headWordUpdate.next = prevWordNode.value.next
      
      prevWordUpdate.next = head[0].id

   

      // console.log('^^^^^^^^^^^^^^^^^^^^^  AFTER   ^^^^^^^^^^^^^^^^^^^^^^')
      // ListService.displayList(LL)

      // update language table (points to new head id # and totalScore)
   const updatedTotalScore= await  LanguageService.updateUserLanguage(
        req.app.get('db'),
      req.user.id, 
        langTableUpdate
   )
      

      //update word table (updates in/correct_count and next id # on word just guessed on)
     const oldHead = await LanguageService.updateWordById(
        req.app.get('db'),
        head[0].id,
        headWordUpdate
      )

      
// update prevWord after oldHead is moved (updates next id # to point to old head)      
     await LanguageService.updateWordById(
        req.app.get('db'),
        prevWordNode.value.id,
        prevWordUpdate
      )

//get new head (original, word correct count and incorrect count)
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
  totalScore: updatedTotalScore[0],
  wordCorrectCount: word[0].correct_count,
  wordIncorrectCount: word[0].incorrect_count ,
  answer: resObj.answer,
  isCorrect:resObj.isCorrect,
})
      

     next()
    } catch (error) {
     next(error)
    }
  })


  .post('/word', jsonBodyParser, async (req, res, next) => {
    const { original,translation, language_id } = req.body.word
    const newWord = {
      original,
      translation,
      language_id,
      correct_count: 0,
      incorrect_count:0,
      memory_value: 1,
    }
    
    try {
      
    
      for (const [key, value] of Object.entries(newWord)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })
        }
      }

      console.log(newWord, '***** NEW WORD *****')


      let head = await LanguageService.getHeadWord(
        req.app.get('db'),
        req.user.id,
      );

      newWord.next = head[0].next


        let insertedWord = await LanguageService.insertWord( // insert into database so we can retrieve it's id
          req.app.get('db'),
          newWord
        )
      let newNextId = insertedWord.id
      
      let headWordUpdate = {
          next : newNextId
        }
      await LanguageService.updateWordById(
        req.app.get('db'),
        head[0].id,
        headWordUpdate
        )
  

  



      

            res
              .status(201)
              .location(`/word/${insertedWord.id}`)
              .json(serializeWord(insertedWord))
        
      
     next()
    } catch (error){
      next(error)
    }
  })



module.exports = languageRouter
