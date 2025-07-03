const express = require('express');

const { verifyAuthentication, getUserDataFromAuthToken } = require('../controllers/token-controller');
const UserController = require('../controllers/users/user-login-controller');
const { STATUS_CODES, sendResult, sendError, getClientIpAddress } = require('../utilities/utilities');
const config = require('../config');

// eslint-disable-next-line new-cap
const router = express.Router();

// ------ AUTH ------

router.post('/login', (req, res, next) => {
	const ipAddress = getClientIpAddress(req);
	const userAgent = req.headers['user-agent'] || '';
	
	UserController.login(req.body, ipAddress, userAgent)
		.then((result) => {
			const { refreshToken, ...resultWithoutRefreshToken } = result;
			
			res.cookie('refreshToken', refreshToken, {
				maxAge: config.jwt.auth.refresh.expire * 60 * 1000,
				httpOnly: true,
				secure: true,
				sameSite: 'None'
			});
			sendResult(res, next, STATUS_CODES.SUCCESS, resultWithoutRefreshToken);
		})
		.catch((error) => sendError(res, next, STATUS_CODES.INTERNAL_SERVER_ERROR, error));
});

router.post('/refresh', (req, res, next) => {
	const refreshToken = req.cookies?.refreshToken;
	
	UserController.refresh({ refreshToken })
		.then((result) => sendResult(res, next, STATUS_CODES.SUCCESS, result))
		.catch((error) => sendError(res, next, STATUS_CODES.INTERNAL_SERVER_ERROR, error));
});

router.post('/logout', (req, res, next) => {
	const refreshToken = req.cookies?.refreshToken;
	
	UserController.logout({ refreshToken })
		.then(result => sendResult(res, next, STATUS_CODES.SUCCESS, { result }))
		.catch(error => sendError(res, next, STATUS_CODES.INTERNAL_SERVER_ERROR, error));
});

router.post('/profile', verifyAuthentication(), async (req, res, next) => {
	const user = getUserDataFromAuthToken(req);
	
	UserController.getProfile(user?.id)
		.then((result) => sendResult(res, next, STATUS_CODES.SUCCESS, result))
		.catch((error) => sendError(res, next, STATUS_CODES.INTERNAL_SERVER_ERROR, error));
});

router.post('/register', (req, res, next) => {
	UserController.register(req.body, getClientIpAddress(req))
		.then((result) => {
			const { refreshToken, ...resultWithoutRefreshToken } = result;
			
			res.cookie('refreshToken', refreshToken, {
				maxAge: config.jwt.auth.refresh.expire * 60 * 1000,
				httpOnly: true,
				secure: true,
				sameSite: 'None'
			});
			sendResult(res, next, STATUS_CODES.SUCCESS, resultWithoutRefreshToken);
		})
		.catch((error) => sendError(res, next, STATUS_CODES.INTERNAL_SERVER_ERROR, error));
});

module.exports = router;
