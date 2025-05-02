const jwt = require('jsonwebtoken');

const { sendError, STATUS_CODES, ApiException } = require('../utilities/utilities');

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers['authorization'];

        if (!token) {
            throw new ApiException('refresh_token_error', 'Refresh token is required', {
                httpStatusCode: STATUS_CODES.FORBIDDEN,
            });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                throw new ApiException('refresh_token_error', 'Refresh token is not valid', {
                    httpStatusCode: STATUS_CODES.USER_NOT_AUTHORIZED,
                });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        sendError(res, null, STATUS_CODES.INTERNAL_SERVER_ERROR, error);
    }
};

module.exports = {
    verifyToken
};