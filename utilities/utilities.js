const { ipAddressRegexp } = require('../constants/regexp');
const config = require('../config');
const STATUS_CODES = {
    // ----- INFORMATION ----- //
    CONTINUE: 100,
    SWITCHING_PROTOCOL: 101,
    PROCESSING: 102, // WebDAV
    EARLY_HINTS: 103, // experimental
    // ----- SUCCESSFUL ----- //
    OK: 200,
    SUCCESS: 200,
    CREATED: 201,
    INSERTING_SUCCESS: 201,
    ACCEPTED: 202,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NO_CONTENT: 204,
    RESET_CONTENT: 205,
    PARTIAL_CONTENT: 206,
    MULTI_STATUS: 207, // WebDAV
    ALREADY_REPORTED: 208, // WebDAV
    IM_USED: 226, // HTTP Delta encoding
    // ----- SUCCESS ----- //
    MULTIPLE_CHOICE: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    USE_PROXY: 305, // deprecated
    SWITCH_PROXY: 306, // deprecated
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,
    // ----- CLIENT ----- //
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    USER_NOT_AUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    REQUEST_ENTITY_TOO_LARGE: 413,
    REQUEST_URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    REQUESTED_RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    MISDIRECTED_REQUEST: 421,
    UNPROCESSABLE_CONTENT_: 422, // WebDAV
    LOCKED_: 423, // WebDAV
    FAILED_DEPENDENCY_: 424, // WebDAV
    TOO_EARLY_: 425, // experimental
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,
    // ----- SERVER ----- //
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    VARIANT_ALSO_NEGOTIATES: 506,
    INSUFFICIENT_STORAGE_: 507, // WebDAV
    LOOP_DETECTED_: 508, // WebDAV
    NOT_EXTENDED: 510,
    NETWORK_AUTHENTICATION_REQUIRED: 511
};

class ApiException extends Error {
    constructor(code, message, options = null) {
        super(message);
        
        this.code = code;
        this.name = this.constructor.name;
        this.httpStatusCode = typeof options?.httpStatusCode === 'number'
          ? options.httpStatusCode
          : 500;
        this.data = options?.data;
    }
}

const sendResult = (response, next, status, resultObject) => {
    if (resultObject) {
        response.status(status).json(resultObject);
    } else {
        response.status(status).end();
    }
    
    if (next) {
        next();
    }
};

const sendError = (response, next, status, error) => {
    if (error instanceof ApiException) {
        const httpStatusCode = error.httpStatusCode !== STATUS_CODES.INTERNAL_SERVER_ERROR
          ? error.httpStatusCode
          : status;
        const resultError = {
            name: error.code,
            message: error.message
        };
        
        if (error.data) {
            resultError.data = error.data;
        }
        
        response.status(httpStatusCode).json({
            error: resultError
        });
    } else if (error instanceof Error) {
        response.status(status).json({
            error: {
                name: error.name,
                message: error.message
            }
        });
    } else if (error instanceof String) {
        response.status(status).json({ error });
    } else {
        response.status(status).json({ error: error.toString() });
    }
    
    if (next) {
        next();
    }
};

const getJoiErrorMessage = (errorValidationObj, customMessage) => {
    return config.mode === 'development'
      ? errorValidationObj.message
      : customMessage;
};

const getClientIpAddress = (req) => {
    let ipAddress = req.headers['x-forwarded-for'] ||
      req?.ip ||
      req?.connection?.remoteAddress ||
      req?.socket?.remoteAddress ||
      req?.connection?.soket?.remoteAddress;
    
    if (ipAddressRegexp.test(ipAddress)) {
        return ipAddress;
    }
    
    if (ipAddressRegexp.test(req?.ip)) {
        ipAddress = req.ip;
    } else if (ipAddressRegexp.test(req?.connection?.remoteAddress)) {
        ipAddress = req.connection.remoteAddress;
    } else if (ipAddressRegexp.test(req?.socket?.remoteAddress)) {
        ipAddress = req.socket.remoteAddress;
    } else if (req?.connection?.soket && ipAddressRegexp.test(req?.connection?.soket?.remoteAddress)) {
        ipAddress = req.connection.soket.remoteAddress;
    }
    
    return ipAddress;
};

module.exports = {
    STATUS_CODES,
    ApiException,
    sendResult,
    sendError,
    getJoiErrorMessage,
    getClientIpAddress
};