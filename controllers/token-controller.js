const jwt = require('jsonwebtoken');
const validator = require('validator');

const config = require('../config');
const {
	sendError, STATUS_CODES, ApiException, getClientIpAddress
} = require('../utilities/utilities');

const getTokenObj = (token, secretKey) => {
	if (!token) {
		return false;
	}
	
	try {
		return jwt.verify(token, secretKey);
	} catch {
		return false;
	}
};

const verifyAuthToken = (token, options = null) => {
	const verifiedTokenObj = getTokenObj(token, config.jwt.auth.access.secretKey);
	
	if (
		!verifiedTokenObj ||
		verifiedTokenObj?.type !== 'auth' ||
		!verifiedTokenObj?.user
	) {
		return false;
	}
	
	if (
		!verifiedTokenObj?.exp ||
		verifiedTokenObj.exp * 1000 < new Date().getTime()
	) {
		if (options?.throwFailedExpire === true) {
			throw new ApiException('expire_error', 'token is expired');
		}
		return false;
	}
	
	if (
		!validator.isUUID(verifiedTokenObj.user?.id, 4) ||
		!validator.isUUID(verifiedTokenObj.sessionId, 4) ||
		typeof verifiedTokenObj.user?.ipAddress !== 'string'
	) {
		return false;
	}
	
	if (
		verifiedTokenObj.user.ipAddress !== options?.ipAddress
	) {
		
		// if (config.mode === APP_MODES.DEV) {
		// 	return false;
		// }
	}
	
	return verifiedTokenObj;
};

const verifyAuthentication = () => {
	return async (req, res, next) => {
		try {
			const ipAddress = getClientIpAddress(req);
			const authToken = req.header(config.jwt.auth.headerKey);
			const refreshToken = req.cookies?.refreshToken;
			// console.log(refreshToken);
			
			let verified = false;
			let responseError = new ApiException(
				'user_not_authorized', 'user is not authorized', {
					httpStatusCode: STATUS_CODES.USER_NOT_AUTHORIZED
				}
			);
			
			if (!refreshToken) {
				sendError(res, null, STATUS_CODES.USER_NOT_AUTHORIZED, responseError);
				return;
			}
			
			const { verifySessionByToken } = require('./users/user-session-controller');
			verifySessionByToken(authToken, ipAddress)
				.then(result => {
					const authTokenObj = verifyAuthToken(authToken, { ipAddress: ipAddress });
					req.userData = authTokenObj.user;
					verified = result === true;
				})
				.catch(error => {
					responseError = error;
				})
				.finally(() => {
					if (verified === true) {
						next();
						return;
					}
					
					sendError(res, null, STATUS_CODES.USER_NOT_AUTHORIZED, responseError);
				});
		} catch (error) {
			sendError(res, null, STATUS_CODES.INTERNAL_SERVER_ERROR, new ApiException('auth_fatal_error', error));
		}
	};
};

const generateAuthToken = async (options) => {
	if (
		!validator.isUUID(options.user?.id, 4) ||
		!validator.isUUID(options.sessionId, 4) ||
		typeof options.user?.ipAddress !== 'string'
	) {
		throw new ApiException('payload_error', 'some data are invalid');
	}
	
	const payload = {
		type: 'auth',
		sessionId: options.sessionId,
		user: {
			id: options.user.id,
			ipAddress: options.user.ipAddress
		}
	};
	
	return {
		access: jwt.sign(payload, config.jwt.auth.access.secretKey, { expiresIn: config.jwt.auth.access.expire * 60 }),
		refresh: jwt.sign(
			payload, config.jwt.auth.refresh.secretKey, { expiresIn: config.jwt.auth.refresh.expire * 60 }
		)
	};
};

const getUserDataFromAuthToken = (req) => {
	const ipAddress = getClientIpAddress(req);
	const authToken = req.header(config.jwt.auth.headerKey);
	
	if (!authToken) {
		return false;
	}
	
	const authTokenObj = verifyAuthToken(authToken, { ipAddress });
	
	if (!authTokenObj || !authTokenObj.user) {
		return false;
	}
	
	return authTokenObj.user;
};

module.exports = {
	getTokenObj,
	verifyAuthToken,
	verifyAuthentication,
	generateAuthToken,
	getUserDataFromAuthToken
};