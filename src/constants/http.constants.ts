/**
 * See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * Add more statutes from the url as you see fit
 */
export enum HTTP_STATUS {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    CONFLICT = 409,
    GONE = 410,
    TEAPOT = 418,
    UNPROCESSABLE_CONTENT = 422,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
}

export enum HTTP_METHODS {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
    PATCH = 'patch',
}

export enum HTTP_PARAMETERS {
    BODY = 'body',
    QUERY = 'query',
    HEADER = 'header',
    PATH = 'path',
}