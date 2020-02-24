const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const errorHandler = require('./middleware/error-handler')
const authRouter = require('./auth/auth-router')
const languageRouter = require('./language/language-router')
const userRouter = require('./user/user-router')
var unirest = require("unirest");
const jsonBodyParser= express.json()

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test',
}))
app.use(cors())
app.use(helmet())

app.use('/api/auth', authRouter)
app.use('/api/language', languageRouter)
app.use('/api/user', userRouter)
// app.use('/api/translation', transRouter)

app.get('/api/translation', jsonBodyParser,(req, res, next) => {
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


app.use(errorHandler)

module.exports = app
