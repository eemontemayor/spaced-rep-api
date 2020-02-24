const express = require('express')
const TranslationService = require('./trans-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonBodyParser = express.json()
const transRouter = express.Router()
const unirest = require("unirest");
transRouter
// .use(requireAuth)
.get('/', jsonBodyParser,async (req, res, next) => {
    console.log('aqui')
    
  
    const text = req.query.text
    unirest.get( "https://translated-mymemory---translation-memory.p.rapidapi.com/api/get")
    .query({
      "mt": "1",
      "onlyprivate": "0",
      "de": "a@b.c",
      "langpair": "en|es",
      "q": text
    })
    .headers({
      "x-rapidapi-host": "translated-mymemory---translation-memory.p.rapidapi.com",
      "x-rapidapi-key": "b5f70bd1c9msh133a4bbdfb3c433p1463c0jsn8429fb0c932c"
    })
    .end((response)=>{
      if (res.error) throw new Error(res.error);
      console.log(res.body)
      return res.status(200).send(response)
    })
  
})
  
module.exports = transRouter