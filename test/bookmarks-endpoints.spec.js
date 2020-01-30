const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks-fixtures')
const store = require('../src/store')

describe('Bookmarks Endpoints', function() {
    let db, bookmarksCopy
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })
    after('disconnect from db', () => db.destroy())
    before('clean the table', () => db('bookmarks').truncate())
    afterEach('cleanup', () => db('bookmarks').truncate())
    // TODO: refactor to use db when updating POST and DELETE
    beforeEach('copy the bookmarks', () => {
        // copy the bookmarks so we can restore them after testing
        bookmarksCopy = store.bookmarks.slice()
    })
    // TODO: refactor to use db when updating POST and DELETE
    afterEach('restore the bookmarks', () => {
        // restore the bookmarks back to original
        store.bookmarks = bookmarksCopy
    })

    describe(`Unauthorized requests`, () => {
        it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
          return supertest(app)
            .get('/bookmarks')
            .expect(401, { error: 'Unauthorized request' })
        })
    
        it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
          return supertest(app)
            .post('/bookmarks')
            .send({ title: 'test-title', url: 'http://some.thing.com', rating: 1 })
            .expect(401, { error: 'Unauthorized request' })
        })
    
        it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
          const secondBookmark = store.bookmarks[1]
          return supertest(app)
            .get(`/bookmarks/${secondBookmark.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })
    
        it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
          const aBookmark = store.bookmarks[1]
          return supertest(app)
            .delete(`/bookmarks/${aBookmark.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })
    })

    describe(`GET /bookmarks`, () => {
        context('Given there are articles in the database', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it('responds with 200 and all of the bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testBookmarks)
            })
        })

        context(`Given no bookmarks`, () => [
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        ])
    })

    describe(`GET /bookmarks/:id`, () => {
        const testBookmarks = makeBookmarksArray()
        beforeEach('insert bookmarks', () => {
            return db
                .into('bookmarks')
                .insert(testBookmarks)
        })

        context(`Given there are no bookmarks`, () => {
            it('responds with a 404', () => {
                const bookmarkId = 12345
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .expect(404, { error: { message: `Article doesn't exist` } })
            })
        })

        context(`Given there are articles in the database`, () => {
            it('it responds with 200 and the specified article', () => {
                const bookmarkId = 2
                const expectedBookmark = testBookmarks[bookmarkId - 1]
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .expect(200, expectedBookmark)
            })
        })
    })
})