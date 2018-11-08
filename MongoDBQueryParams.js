const assert = require("assert"),
  QueryParams = require("./QueryParams"),
  InvalidQueryParamException = require("./exceptions/InvalidQueryParamException");

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
        return "$neq";
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
      var filterElements = [];
      if (rawFilter.trim() != "") {
        filterElements = rawFilter.split(" ");
      }
      let filter = filterElements.reduce((filter, current) => {
        /* We use a regular expression to obtain the parts of our order */
        var result = this.filterRegExp.exec(current);
        if (!result) {
          throw new InvalidQueryParamException("filter", rawFilter);
        }
        /* Exec returns undefined results sometimes so we clean them */
        result = result.filter(value => value != null);
        const field = result[1];
        if (result.length == 2) {
          /* CASE 1: Text Search Operation */
          if (!filter["$text"]) {
            filter["$text"] = {
              $search: field
            };
          } else {
            filter["$text"]["$search"] += ` ${field}`;
          }
        } else if (result.length == 3) {
          /* CASE 2: Exact match query */
          let field = result[1],
            value = result[2],
            isNumber = !isNaN(parseFloat(value)),
            isDate = isNaN(value) && !isNaN(Date.parse(new Date(value))),
            isBoolean = value == "true" || value == "false";
          /* When parsing dates, all numbers all considered dates but not all dates are
              considered numbers, so we give presedence to the date parser */
          if (isDate) {
            value = new Date(value);
          } else if (isNumber) {
            value = parseFloat(value);
          } else if (isBoolean) {
            value = value == "true" ? true : false;
          } else {
            value = new RegExp(value, "i");
          }
          filter[field] = value;
        } else if (result.length == 4) {
          /* CASE 3: Operator */
          let field = result[1],
            operator = result[2],
            value = result[3],
            isNumber = !isNaN(parseFloat(value)),
            isDate = !isNaN(Date.parse(value)),
            isBoolean = value == "true" || value == "false";
          if (isNumber) {
            value = parseFloat(value);
          } else if (isDate) {
            value = new Date(value);
          } else if (isBoolean) {
            value = value == "true" ? true : false;
          } else {
            value = new RegExp(value, "i");
          }
          filter[field] = {};
          filter[field][this.mapToMongoOperator(operator)] = value;
        } else {
          throw new InvalidQueryParamException("filter", rawFilter);
        }
        return filter;
      }, {});
      /* Filters in MongoDB are consired as AND by default, so we only add the case
        where de defaultOperator is OR */
      if (this.defaultOperator === this.OR) {
        return {
          $or: filter
        };
      }
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
