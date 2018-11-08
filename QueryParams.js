const querystring = require("querystring"),
  assert = require("assert"),
  InvalidQueryParamException = require("./exceptions/InvalidQueryParamException");

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

  get AND() {
    return "AND";
  }

  get OR() {
    return "OR";
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
   * @memberof QueryParams
   */
  getDefaultOperator() {
    try {
      var defaultOperator = this.rawData.defaultOperator || this.AND;
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

module.exports = QueryParams;
