const InvalidQueryParamException = require("./exceptions/InvalidQueryParamException"),
  assert = require("assert"),
  querystring = require("querystring");

/**
 * Base implementation of the CRAF queryparams processing. It is inteded to be used as
 * a base class for other query params implementation
 *
 *
 * @class QueryParams
 */
class QueryParams {
  /**
   * Creates an instance of QueryParams.
   * @param {*} [rawData={}]
   * @memberof QueryParams
   */
  constructor(rawData = {}) {
    if (typeof rawData === "string") {
      this.rawData = querystring(rawData);
    } else {
      this.rawData = rawData;
    }
  }

  /**
   * It returns the Regular Expresion used to parse the filter parameter from the querystring
   *
   * @readonly
   * @memberof QueryParams
   */
  get filterRegExp() {
    return /^([a-zA-Z0-9@._]+):(>|>=|<|<=|==|!=){0,1}([a-zA-Z0-9@.\-:_]+)|(\+|-){0,1}([a-zA-Z_0-9]+)$/;
  }

  /**
   * It returns the Regular Expresion used to parse the sort parameter from the querystring
   *
   * @readonly
   * @memberof QueryParams
   */
  get sortRegExp() {
    return /^([a-zA-Z_0-9]+):(asc|desc)$/;
  }

  /**
   * It returns the Regular Expresion used to parse the default operator parameter from the querystring
   *
   * @readonly
   * @memberof QueryParams
   */
  get defaultOperatorRegExp() {
    return /^OR|AND$/i;
  }

  /**
   * Obtains the skip parameter from the url and parses it to an int.
   * The skip parameter is used for pagination.
   *
   * @memberof QueryParams
   */
  getSkip() {
    const rawSkip = this.rawData.skip || 0;
    try {
      assert(!isNaN(rawSkip));
      return parseInt(rawSkip);
    } catch (error) {
      throw new InvalidQueryParamException("skip", rawSkip);
    }
  }

  /**
   * Obtains the limit parameter from the url and parses it to an int.
   * The skip parameter defines the number of results returned.
   *
   * @memberof QueryParams
   */
  getLimit() {
    const rawLimit = this.rawData.limit || 50;
    try {
      assert(!isNaN(rawLimit));
      return parseInt(rawLimit);
    } catch (error) {
      throw new InvalidQueryParamException("limit", rawLimit);
    }
  }

  /**
   * Obtains the field parameter from the url.
   * The fields parameter is used to define the query projection.
   * It is recommended to always use fields with the minimun fields posible
   * to gain performance
   *
   * @memberof QueryParams
   */
  getFields() {
    try {
      var rawFields = this.rawData.fields || "";
      var fields = [];
      if (rawFields.trim() != "") {
        fields = rawFields.split(" ");
      }
      return fields;
    } catch (error) {
      throw new InvalidQueryParamException("fields", rawFields);
    }
  }

  /**
   * Obtains the default_operator paramter.
   *
   * This parameter is used to choose whether to consecutive
   * filters are combined with an AND or an OR
   *
   * @throws InvalidQueryParamException
   * @returns
   * @memberof ElasticSearchUriQueryParams
   */
  getDefaultOperator() {
    try {
      var defaultOperator = this.rawData.defaultOperator || "AND";
      assert(
        typeof defaultOperator === "string" || defaultOperator instanceof String
      );
      /* We use a regular expression validate the given input */
      const matches = this.defaultOperatorRegExp.test(defaultOperator);
      if (!matches) {
        throw new InvalidQueryParamException(
          "defaultOperator",
          defaultOperator
        );
      }
      return defaultOperator.toUpperCase();
    } catch (error) {
      throw new InvalidQueryParamException("defaultOperator", defaultOperator);
    }
  }
}

/**
 * Implementation of the CRAF queryparams processing for Elastic Search
 * Uri Api.
 *
 * As this class is aimed for the Elastic Search Uri Search Api
 * it is recommended to read the Api's documentation
 *
 * https://www.elastic.co/guide/en/elasticsearch/reference/current/search-uri-request.html
 *
 * @class ElasticSearchUriQueryParams
 * @extends {QueryParams}
 */
class ElasticSearchUriQueryParams extends QueryParams {
  constructor(params) {
    super(params);
    this.sort = this.getSort();
    this.skip = this.getFrom();
    this.limit = this.getSize();
    this.filter = this.getFilter();
    this.fields = this.getSource();
  }
  /**
   * Alias for the getLimit method. Made for readability purposes so
   * it is more similar to the Elastic Search Uri Search Api
   *
   * @returns
   * @memberof ElasticSearchUriQueryParams
   */
  getSize() {
    return this.getLimit();
  }

  /**
   * Alias for the getFields method. Made for readability purposes so
   * it is more similar to the Elastic Search Uri Search Api
   *
   * @returns
   * @memberof ElasticSearchUriQueryParams
   */
  getSource() {
    return this.getFields();
  }

  /**
   * Alias for the getSkip method. Made for readability purposes so
   * it is more similar to the Elastic Search Uri Search Api
   *
   * @returns
   * @memberof ElasticSearchUriQueryParams
   */
  getFrom() {
    return this.getSkip();
  }

  /**
   * Obtains the sort parameters from the CRAF querystring and
   * returns an Elasctic Search Uri Search sort parameter
   *
   * @throws InvalidQueryParamException
   * @returns
   * @memberof ElasticSearchUriQueryParams
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
      return sortElements.reduce((result, current, index, array) => {
        /* We use a regular expression to obtain the parts of our order */
        const matches = this.sortRegExp.test(current);
        if (!matches) {
          throw new InvalidQueryParamException("sort", rawSort);
        }
        result += `${current}`;
        if (index < array.length - 1) {
          result += " ";
        }
        return result;
      }, "");
    } catch (error) {
      throw new InvalidQueryParamException("sort", rawSort);
    }
  }

  /**
   *
   * Obtains the filter parameters given by the user through the
   * request url so it can process them to a elasticSearch
   * acceptable format. Because the current (September 2018)
   * Uri format was used as inspiration for the CRAF Uri parameters,
   * this method mostly validates the params format
   *
   * @throws InvalidQueryParamException
   * @returns
   * @memberof ElasticSearchUriQueryParams
   */
  getFilter() {
    try {
      /* We obtain the raw filter string */
      var rawFilter = this.rawData.filter || "";
      assert(typeof rawFilter === "string" || rawFilter instanceof String);
      rawFilter = rawFilter.trim();
      var filterElements = [];
      if (rawFilter.trim() != "") {
        filterElements = rawFilter.split(" ");
      }
      return filterElements.reduce((filter, current, index, array) => {
        /* We use a regular expression to obtain the parts of our order */
        var result = this.filterRegExp.exec(current);
        if (!result) {
          throw new InvalidQueryParamException("filter", rawFilter);
        }
        /* Exec returns undefined results sometimes so we clean them */
        result = result.filter(value => value != null);
        if (result.length == 2) {
          const field = result[1];
          filter += `${field}`;
        } else if (result.length == 3) {
          const field = result[1],
            value = result[2];
          filter += `${field}:${value}`;
        } else if (result.length == 4) {
          /* CASE 3: Operator */
          const field = result[1],
            operator = result[2],
            value = result[3];
          if (operator === "==") {
            filter += `${field}:${value}`;
          } else if (operator === "!=") {
            filter += `!(${field}:${value})`;
          } else {
            filter += `${field}:${operator}${value}`;
          }
        }
        if (index < array.length - 1) {
          filter += " ";
        }
        return filter;
      }, "");
    } catch (error) {
      throw new InvalidQueryParamException("filter", rawFilter);
    }
  }

  /**
   * Uses the other class methods to form an ElasticSearch Uri Querystring
   *
   * Because default_operator cannot be used without the q parameter, we
   * only send it when the q parameter is not empty
   *
   * @returns
   * @memberof ElasticSearchUriQueryParams
   */
  getQuerystring() {
    const from = this.getFrom(),
      size = this.getSize(),
      sort = this.getSort(),
      _source = this.getSource(),
      defaultOperator = this.getDefaultOperator(),
      filter = this.getFilter();

    var querystring = `?&from=${from}&size=${size}&sort=${sort}&_source=${_source}`;
    if (filter.trim() != "") {
      querystring += `&default_operator=${defaultOperator}`;
      querystring += `&q=${filter}`;
    }
    return encodeURI(querystring);
  }
}

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
    this.filter = this.getQuery();
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
      return filterElements.reduce((filter, current) => {
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
            isDate = !isNaN(Date.parse(value)),
            isBoolean = (value == "true") || (value == "false");
          if (isNumber) {
            value = parseFloat(value);
          } else if (isDate) {
            value = new Date(value);
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
            isBoolean = (value == "true") || (value == "false");
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

module.exports = {
  QueryParams,
  ElasticSearchUriQueryParams,
  MongoDBQueryParams
};
