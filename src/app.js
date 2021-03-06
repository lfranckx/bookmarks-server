require('dotenv').config()
const express = require('express')
const validateBearerToken = require('./validateBearerToken')
const errorHandler = require('./errorHandler')
const bookmarksRouter = require('./Bookmarks-Router/Bookmarks-Router')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

const app = express()

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(validateBearerToken)

app.use('/api', bookmarksRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(errorHandler)

module.exports = app