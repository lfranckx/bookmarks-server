require('dotenv').config()
const logger = require('./logger')

const validateBearerToken = function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    console.log(apiToken)
    const authToken = req.get('Authorization')
    logger.error(`Unauthorized request to path: ${req.path}`);
    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error()
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
}

module.exports = validateBearerToken