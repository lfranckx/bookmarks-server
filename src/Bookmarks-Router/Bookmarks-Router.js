const express = require('express')
const uuid = require('uuid/v4')
const { isWebUri } = require('valid-url') // URL validation 
const logger = require('../logger')
const store = require('../store')
// const bookmarks = require('../store')
const BookmarksService = require('../bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    rating: Number(bookmark.rating),
})

bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res) => {
        // validate that each item exists inside of req
        for (const field of ['title', 'url', 'rating']) {
            if (!req.body[field]) {
            logger.error(`${field} is required`)
            return res.status(400).send(`'${field}' is required`)
            }
        }

        const { title, url, description, rating } = req.body;
        // validate that rating is between 0-5
        if(!Number.isInteger(rating) || rating < 0 || rating > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send(`'rating' must be a number between 0 and 5`)
        }
        // validate URL is a valid URL
        if(!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).send(`'url' must be a valid URL`)
        }
        // if all requirements pass create id for new bookmark
        const bookmark = {
            id: uuid(),
            title,
            url,
            description,
            rating
        }
        store.bookmarks.push(bookmark);
        // log the creation of new bookmark and send a res w header location
        logger.info(`Bookmark with id ${id} created`);
        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
            .json(bookmark)
    })

bookmarksRouter
    .route('/bookmarks/:id')

    .get((req, res) => {
        const { id } = req.params
        const bookmark = store.bookmarks.find(bm => bm.id == id);
        // validate bookmark id is found
        if(!bookmark) {
            logger.error(`Bookmark with id ${id} is not found.`);
            return res
                .status(404)
                .send('Card not found');
        }
        res.json(bookmark)
    })

    .delete((req, res) => {
        const { id } = req.params
        const bookmarkIndex = store.bookmarks.findIndex(bm => bm.id === id);
        // validate bookmark id is found
        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send(`Bookmark not found`)
        }
        // delete bookmark and log deletion
        store.bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} deleted.`)

        res
            .status(204)
            .end()
    })

module.exports = (bookmarksRouter)