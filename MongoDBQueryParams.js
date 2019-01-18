const assert = require("assert"),
  QueryParams = require("./QueryParams"),
  InvalidQueryParamException = require("./exceptions/InvalidQueryParamException"),
  nearley = require("nearley"),
  grammar = require("./parser/grammar.js");
/**
 * Implementation of the CRAF queryparams processing for the MongoDB driver.
 *
 * As this class is aimed for the MongoDB driver
 * it is recommended to read the Api's documentation
 *
 * http://mongodb.github.io/node-mongodb-native/3.1/api/index.html
 *
 * @class MongoDBQueryParams
 * @extends {QueryParams}
 */
class MongoDBQueryParams extends QueryParams {
  constructor(params) {
    super(params);
    this.sort = this.getSort();
    this.skip = this.getSkip();
    this.limit = this.getLimit();
    (this.defaultOperator = this.getDefaultOperator()),
      (this.filter = this.getQuery());
    this.query = this.getQuery();
    this.fields = this.getFields();
  }

  /**
   * Returns the corresponding mongodb operator based on the
   * CRAF API operator
   *
   * @param {*} operator
   * @returns
   * @memberof MongoDBQueryParams
   */
  mapToMongoOperator(operator) {
    switch (operator) {
      case ">":
        return "$gt";
      case ">=":
        return "$gte";
      case "<":
        return "$lt";
      case "<=":
        return "$lte";
      case "==":
        return "$eq";
      case "!=":
        return "$ne";
    }
  }

  /**
   * Returns the corresponding mongodb sort direction value
   * based on the CRAF API direction
   *
   * @param {*} direction
   * @returns
   * @memberof MongoDBQueryParams
   */
  mapToMongoSort(direction) {
    switch (direction) {
      case "asc":
        return 1;
      case "desc":
        return -1;
    }
  }

  /**
   * Obtains the sort parameters from the CRAF querystring and
   * returns an MongoDB driver sort object
   *
   * @throws InvalidQueryParamException
   * @returns
   * @memberof MongoDBQueryParams
   */
  getSort() {
    try {
      /* */
      var rawSort = this.rawData.sort || "";
      assert(typeof rawSort === "string" || rawSort instanceof String);
      rawSort = rawSort.trim();
      var sortElements = [];
      if (rawSort.trim() != "") {
        sortElements = rawSort.split(" ");
      }
      return sortElements.reduce((sort, current) => {
        const result = this.sortRegExp.exec(current);
        if (!result) {
          throw new InvalidQueryParamException("sort", rawSort);
        }
        const field = result[1],
          direction = result[2];
        sort[field] = this.mapToMongoSort(direction);
        return sort;
      }, {});
    } catch (error) {
      throw new InvalidQueryParamException("sort", rawSort);
    }
  }

  /**
   * Uses the other class methods to create the query options object for the
   * MongoDB driver
   *
   * @returns
   * @memberof MongoDBQueryParams
   */
  getQuery() {
    try {
      /* */
      var rawFilter = this.rawData.filter || "";
      assert(typeof rawFilter === "string" || rawFilter instanceof String);
      rawFilter = rawFilter.trim();
      if (!rawFilter) return {};
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      const [filter] = parser.feed(rawFilter).results;
      return filter;
    } catch (error) {
      throw new InvalidQueryParamException("filter", rawFilter);
    }
  }

  getProjection() {
    const projection = this.getFields();
    return projection.length > 0 ? projection : null;
  }

  /**
   * Uses the other class methods to form a MongoDB query object
   *
   * @returns
   * @memberof MongoDBQueryParams
   */
  getQueryOptions() {
    return {
      skip: this.getSkip(),
      limit: this.getLimit(),
      sort: this.getSort(),
      projection: this.getProjection()
    };
  }
}

module.exports = MongoDBQueryParams;
