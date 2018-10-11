/**
 * Example Class for demostrating the error handler logic
 *
 * @class ExampleException
 * @extends {Error}
 */
class InvalidQueryParamException extends Error {

    /**
     *Creates an instance of InvalidQueryParamException.
     * @param {*} args
     * @memberof InvalidQueryParamException
     */
    constructor(param, paramValue) {
        super("An invalid QueryParam has been given")
        this.name = "InvalidQueryParamException";
        this.status = 500;
        this.param = param;
        this.paramValue = paramValue;
    }
}

module.exports = InvalidQueryParamException;