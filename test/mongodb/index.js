let chai = require('chai'),
    chaiHttp = require('chai-http'),
    InvalidQueryParamException = require('../../exceptions/InvalidQueryParamException'),
    {
        MongoDBQueryParams
    } = require('../../index');

chai.should();
chai.use(chaiHttp);

//Our parent block
describe('MongoDBQueryParams', () => {

    describe(`limit`, () => {
        it('should be optional', async function () {
            const fn = () => new MongoDBQueryParams({})
            fn.should.not.throw(InvalidQueryParamException);
        });

        it('should accept numbers', async function () {
            const mongoDbQueryParams = new MongoDBQueryParams({
                limit: 1
            })
            mongoDbQueryParams.limit.should.not.be.NaN;
        });

        it('should not accept a non numeric value', async function () {
            const fn = () => new MongoDBQueryParams({
                limit: 'dfdsf'
            })
            fn.should.throw(InvalidQueryParamException);
        });
    });

    describe(`skip`, () => {
        it('should be optional', async function () {
            const fn = () => new MongoDBQueryParams({})
            fn.should.not.throw(InvalidQueryParamException);
        });

        it('should accept numbers', async function () {
            const mongoDbQueryParams = new MongoDBQueryParams({
                skip: 1
            })
            mongoDbQueryParams.limit.should.not.be.NaN;
        });

        it('should not accept a non numeric value', async function () {
            const fn = () => new MongoDBQueryParams({
                skip: 'dfdsf'
            })
            fn.should.throw(InvalidQueryParamException);
        });
    });

    describe(`fields`, () => {
        it('should be optional', async function () {
            const fn = () => new MongoDBQueryParams({})
            fn.should.not.throw(InvalidQueryParamException);
        });
    });

    describe(`sort`, () => {
        it('should be optional', async function () {
            const fn = () => new MongoDBQueryParams({})
            fn.should.not.throw(InvalidQueryParamException);
        });
    });

    describe(`filter`, () => {
        it('should be optional', async function () {
            const fn = () => new MongoDBQueryParams({})
            fn.should.not.throw(InvalidQueryParamException);
        });
    });

});