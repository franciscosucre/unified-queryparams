let chai = require("chai"),
  chaiHttp = require("chai-http"),
  InvalidQueryParamException = require("../exceptions/InvalidQueryParamException"),
  { MongoDBQueryParams } = require("../index");

chai.should();
chai.use(chaiHttp);

//Our parent block
describe("MongoDBQueryParams", () => {
  describe(`limit`, () => {
    it("should be optional", async function() {
      const fn = () => new MongoDBQueryParams({});
      fn.should.not.throw(InvalidQueryParamException);
    });

    it("should accept numbers", async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        limit: 1
      });
      mongoDbQueryParams.limit.should.not.be.NaN;
    });

    it("should not accept a non numeric value", async function() {
      const fn = () =>
        new MongoDBQueryParams({
          limit: "dfdsf"
        });
      fn.should.throw(InvalidQueryParamException);
    });
  });

  describe(`skip`, () => {
    it("should be optional", async function() {
      const fn = () => new MongoDBQueryParams({});
      fn.should.not.throw(InvalidQueryParamException);
    });

    it("should accept numbers", async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        skip: 1
      });
      mongoDbQueryParams.limit.should.not.be.NaN;
    });

    it("should not accept a non numeric value", async function() {
      const fn = () =>
        new MongoDBQueryParams({
          skip: "dfdsf"
        });
      fn.should.throw(InvalidQueryParamException);
    });
  });

  describe(`fields`, () => {
    it("should be optional", async function() {
      const fn = () => new MongoDBQueryParams({});
      fn.should.not.throw(InvalidQueryParamException);
    });

    it("should a word", async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        fields: "name"
      });
      mongoDbQueryParams.fields.should.be.an("array");
      mongoDbQueryParams.fields.length.should.be.eql(1);
    });

    it("should multiple space separated words", async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        fields: "name email password"
      });
      mongoDbQueryParams.fields.should.be.an("array");
      mongoDbQueryParams.fields.length.should.be.eql(3);
    });
  });

  describe(`sort`, () => {
    it("should be optional", async function() {
      const fn = () => new MongoDBQueryParams({});
      fn.should.not.throw(InvalidQueryParamException);
    });

    it('should accept a fieldname with "asc" direcction', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        sort: "name:asc"
      });
      Object.keys(mongoDbQueryParams.sort).length.should.be.eql(1);
      mongoDbQueryParams.sort.name.should.be.eql(1);
    });

    it('should accept a fieldname with "desc" direcction', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        sort: "name:desc"
      });
      Object.keys(mongoDbQueryParams.sort).length.should.be.eql(1);
      mongoDbQueryParams.sort.name.should.be.eql(-1);
    });

    it('should not accept a direction that is not "asc" or "desc"', async function() {
      const fn = () =>
        new MongoDBQueryParams({
          sort: "name:middle"
        });
      fn.should.throw(InvalidQueryParamException);
    });

    it("should accept multiple fieldnames", async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        sort: "name:desc email:asc"
      });
      Object.keys(mongoDbQueryParams.sort).length.should.be.eql(2);
      mongoDbQueryParams.sort.name.should.be.eql(-1);
      mongoDbQueryParams.sort.email.should.be.eql(1);
    });
  });

  describe(`filter`, () => {
    it("should be optional", async function() {
      const fn = () => new MongoDBQueryParams({});
      fn.should.not.throw(InvalidQueryParamException);
    });

    it("should create a text query if given only a fieldname", async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "name"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.filter.should.have.property("$text");
      mongoDbQueryParams.filter.$text.should.have.property("$search");
      mongoDbQueryParams.filter.$text.$search.should.be.eql("name");
    });

    it('should create a $regex search with the ":" and a string value', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "name:boo"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.filter.should.have.property("name");
      mongoDbQueryParams.filter.name.should.be.eql(/boo/i);
    });

    it('should create a value search with the ":" and a numeric value', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "number:4"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.filter.should.have.property("number");
      mongoDbQueryParams.filter.number.should.be.eql(4);
    });

    it('should create a value search with the ":" and a date value', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "created_at:2018-10-04T09:21:36.676Z"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.filter.should.have.property("created_at");
      mongoDbQueryParams.filter.created_at.should.be.eql(
        new Date("2018-10-04T09:21:36.676Z")
      );
    });

    it('should accept a search with the ":" and a nested field', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "name.bar:boo"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.filter.should.have.property("name.bar");
      mongoDbQueryParams.filter["name.bar"].should.be.eql(/boo/i);
    });

    it('should create a $eq search with the ":==" and a value', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "number:==4"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.filter.should.have.property("number");
      mongoDbQueryParams.filter.number.should.have.property("$eq");
      mongoDbQueryParams.filter.number.$eq.should.be.eql(4);
    });

    it('should create a $ne search with the ":!=" and a value', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "number:!=4"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.filter.should.have.property("number");
      mongoDbQueryParams.filter.number.should.have.property("$ne");
      mongoDbQueryParams.filter.number.$ne.should.be.eql(4);
    });

    it('should create a $gt search with the ":>" and a value', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "number:>4"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.filter.should.have.property("number");
      mongoDbQueryParams.filter.number.should.have.property("$gt");
      mongoDbQueryParams.filter.number.$gt.should.be.eql(4);
    });

    it('should create a $gte search with the ":>=" and a value', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "number:>=4"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.filter.should.have.property("number");
      mongoDbQueryParams.filter.number.should.have.property("$gte");
      mongoDbQueryParams.filter.number.$gte.should.be.eql(4);
    });

    it('should create a $lt search with the ":<" and a value', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "number:<4"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.filter.should.have.property("number");
      mongoDbQueryParams.filter.number.should.have.property("$lt");
      mongoDbQueryParams.filter.number.$lt.should.be.eql(4);
    });

    it('should create a $lte search with the ":<=" and a value', async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "number:<=4"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.filter.should.have.property("number");
      mongoDbQueryParams.filter.number.should.have.property("$lte");
      mongoDbQueryParams.filter.number.$lte.should.be.eql(4);
    });

    it("should chain $and and $or tags, parsing parenthesis", async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "number:<=4 AND number:>=1 OR (boolean:==false)"
      });
      mongoDbQueryParams.should.have.property("filter");
    });

    it("should throw an error if does not use the apropiate format", async function() {
      const fn = () =>
        new MongoDBQueryParams({
          filter: "number:4 for:bar:so"
        });
      fn.should.throw(InvalidQueryParamException);
    });
  });

  describe(`integration`, () => {
    it("should create a complex query", async function() {
      const mongoDbQueryParams = new MongoDBQueryParams({
        filter: "name AND email:hola AND number:==4",
        sort: "name:asc email:desc",
        limit: 10,
        skip: 50,
        fields: "name email number"
      });
      mongoDbQueryParams.should.have.property("filter");
      mongoDbQueryParams.should.have.property("sort");
      mongoDbQueryParams.should.have.property("limit");
      mongoDbQueryParams.should.have.property("skip");
      mongoDbQueryParams.should.have.property("fields");
    });
  });
});
