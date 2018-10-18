let chai = require('chai'),
    chaiHttp = require('chai-http'),
    InvalidQueryParamException = require('../exceptions/InvalidQueryParamException'),
    {
        ElasticSearchUriQueryParams
    } = require('../index');

chai.should();
chai.use(chaiHttp);

//Our parent block
describe('ElasticSearchUriQueryParams', () => {

    describe(`limit`, () => {
        it('should be optional', async function () {
            const fn = () => new ElasticSearchUriQueryParams({})
            fn.should.not.throw(InvalidQueryParamException);
        });

        it('should accept numbers', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                limit: 1
            })
            elasticSearchUriQueryParams.limit.should.not.be.NaN;
        });

        it('should not accept a non numeric value', async function () {
            const fn = () => new ElasticSearchUriQueryParams({
                limit: 'dfdsf'
            })
            fn.should.throw(InvalidQueryParamException);
        });
    });

    describe(`skip`, () => {
        it('should be optional', async function () {
            const fn = () => new ElasticSearchUriQueryParams({})
            fn.should.not.throw(InvalidQueryParamException);
        });

        it('should accept numbers', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                skip: 1
            })
            elasticSearchUriQueryParams.limit.should.not.be.NaN;
        });

        it('should not accept a non numeric value', async function () {
            const fn = () => new ElasticSearchUriQueryParams({
                skip: 'dfdsf'
            })
            fn.should.throw(InvalidQueryParamException);
        });
    });

    describe(`fields`, () => {
        it('should be optional', async function () {
            const fn = () => new ElasticSearchUriQueryParams({})
            fn.should.not.throw(InvalidQueryParamException);
        });

        it('should a word', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                fields: 'name'
            });
            elasticSearchUriQueryParams.fields.should.be.an('array');
            elasticSearchUriQueryParams.fields.length.should.be.eql(1);
        });

        it('should multiple space separated words', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                fields: 'name email password'
            })
            elasticSearchUriQueryParams.fields.should.be.an('array');
            elasticSearchUriQueryParams.fields.length.should.be.eql(3);
        });
    });

    describe(`sort`, () => {
        it('should be optional', async function () {
            const fn = () => new ElasticSearchUriQueryParams({})
            fn.should.not.throw(InvalidQueryParamException);
        });

        it('should accept a fieldname with "asc" direcction', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                sort: 'name:asc'
            });
            elasticSearchUriQueryParams.sort.should.be.eql('name:asc');
        });

        it('should accept a fieldname with "desc" direcction', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                sort: 'name:desc'
            });
            elasticSearchUriQueryParams.sort.should.be.eql('name:desc');
        });

        it('should not accept a direction that is not "asc" or "desc"', async function () {
            const fn = () => new ElasticSearchUriQueryParams({
                sort: 'name:middle'
            })
            fn.should.throw(InvalidQueryParamException);
        });

        it('should accept multiple fieldnames', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                sort: 'name:desc email:asc'
            });
            elasticSearchUriQueryParams.sort.should.be.eql('name:desc email:asc');
        });
    });

    describe(`filter`, () => {
        it('should be optional', async function () {
            const fn = () => new ElasticSearchUriQueryParams({})
            fn.should.not.throw(InvalidQueryParamException);
        });

        it('should create a text query if given only a fieldname', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                filter: 'name'
            });
            elasticSearchUriQueryParams.should.have.property('filter');
            elasticSearchUriQueryParams.filter.should.be.eql('name');
        });

        it('should create a text query if given multiple fieldnames', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                filter: 'name email'
            });
            elasticSearchUriQueryParams.should.have.property('filter');
            elasticSearchUriQueryParams.filter.should.be.eql('name email');
        });

        it('should accept a search with the ":" and a value', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                filter: 'name:boo'
            });
            elasticSearchUriQueryParams.should.have.property('filter');
            elasticSearchUriQueryParams.filter.should.be.eql('name:boo');
        });

        it('should accept a search with the ":" and a nested field', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                filter: 'name.bar:boo'
            });
            elasticSearchUriQueryParams.should.have.property('filter');
            elasticSearchUriQueryParams.filter.should.be.eql('name.bar:boo');
        });

        it('should create a $eq search with the ":==" and a value', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                filter: 'number:==4'
            });
            elasticSearchUriQueryParams.should.have.property('filter');
            elasticSearchUriQueryParams.filter.should.be.eql('number:4');
        });

        it('should create a $neq search with the ":!=" and a value', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                filter: 'number:!=4'
            });
            elasticSearchUriQueryParams.should.have.property('filter');
            elasticSearchUriQueryParams.filter.should.be.eql('!(number:4)');
        });

        it('should create a $gt search with the ":>" and a value', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                filter: 'number:>4'
            });
            elasticSearchUriQueryParams.should.have.property('filter');
            elasticSearchUriQueryParams.filter.should.be.eql('number:>4');
        });

        it('should create a $gte search with the ":>=" and a value', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                filter: 'number:>=4'
            });
            elasticSearchUriQueryParams.should.have.property('filter');
            elasticSearchUriQueryParams.filter.should.be.eql('number:>=4');
        });

        it('should create a $lt search with the ":<" and a value', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                filter: 'number:<4'
            });
            elasticSearchUriQueryParams.should.have.property('filter');
            elasticSearchUriQueryParams.filter.should.be.eql('number:<4');
        });

        it('should create a $lte search with the ":<=" and a value', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                filter: 'number:<=4'
            });
            elasticSearchUriQueryParams.should.have.property('filter');
            elasticSearchUriQueryParams.filter.should.be.eql('number:<=4');
        });

        it('should throw an error if does not use the apropiate format', async function () {
            const fn = () => new ElasticSearchUriQueryParams({
                filter: 'number: 4 for:bar:so'
            })
            fn.should.throw(InvalidQueryParamException);
        });
    });

    describe(`integration`, () => {

        it('should create a complex query', async function () {
            const elasticSearchUriQueryParams = new ElasticSearchUriQueryParams({
                filter: 'name email:hola number:==4',
                sort: 'name:asc email:desc',
                limit: 10,
                skip: 50,
                fields: 'name email number'
            });
            elasticSearchUriQueryParams.should.have.property('filter');
            elasticSearchUriQueryParams.should.have.property('sort');
            elasticSearchUriQueryParams.should.have.property('limit');
            elasticSearchUriQueryParams.should.have.property('skip');
            elasticSearchUriQueryParams.should.have.property('fields');
        });


    });

});