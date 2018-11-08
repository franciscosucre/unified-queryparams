const assert = require("assert"),
  QueryParams = require("./QueryParams"),
  InvalidQueryParamException = require("./exceptions/InvalidQueryParamException");

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

module.exports = ElasticSearchUriQueryParams;
