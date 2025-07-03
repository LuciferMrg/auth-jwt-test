const Joi = require('joi');

const { SessionModel, UserModel } = require('../../models');

const tokenController = require('../token-controller');

const config = require('../../config');
const { ApiException, getJoiErrorMessage } = require('../../utilities/utilities');

const createSession = async (userId, ipAddress, userAgent = '') => {
	const userSchema = Joi.object({
		id: Joi.string().required(),
		ipAddress: Joi.string().required()
	});
	
	const { error: validationError, value: userData } = userSchema.validate({
		id: userId,
		ipAddress: ipAddress
	});
	
	if (validationError) {
		throw new ApiException('data_error', getJoiErrorMessage(validationError, 'some data is incorrect'));
	}
	
	const expireDate = new Date();
	expireDate.setMinutes(expireDate.getMinutes() + config.jwt.auth.refresh.expire);
	
	const session = await SessionModel.create({
		userId: userData.id,
		ip: userData.ipAddress,
		userAgent,
		expire: expireDate,
		active: true
	});
	
	const updatedTokens = await tokenController.generateAuthToken({
		sessionId: session.id,
		user: {
			id: userData.id,
			ipAddress: userData.ipAddress
		}
	});
	
	session.refreshToken = updatedTokens.refresh;
	await session.save();
	
	return {
		accessToken: updatedTokens.access,
		refreshToken: updatedTokens.refresh,
		sessionId: session.id
	};
};

const verifyRefreshToken = async (refreshToken) => {
	const refreshTokenObj = tokenController.getTokenObj(refreshToken, config.jwt.auth.refresh.secretKey);
	
	if (!refreshTokenObj) {
		throw new ApiException('token_error', 'invalid refresh token');
	}
	
	const session = await SessionModel.findOne({
		where: {
			id: refreshTokenObj.sessionId,
			refreshToken,
			active: true
		}
	});
	
	if (!session) {
		throw new ApiException('session_error', 'session not found or inactive');
	}
	
	if (new Date() > session.expire) {
		throw new ApiException('session_expired', 'session has expired');
	}
	
	return {
		user: refreshTokenObj.user,
		sessionId: refreshTokenObj.sessionId
	};
};

const verifySessionByToken = async (authToken, ipAddress) => {
	const verifiedAuthTokenObj = tokenController.verifyAuthToken(authToken, { ipAddress });
	
	if (!verifiedAuthTokenObj) {
		return false;
	}
	
	let userAccount;
	
	userAccount = await UserModel
		.findByPk(verifiedAuthTokenObj.user.id);
	
	if (!userAccount) {
		throw new ApiException('account_not_found_error', 'user account not found');
	}
	
	if (userAccount.isActive === false) {
		throw new ApiException('account_disabled_error', 'user account inactive');
	}
	
	const session = await SessionModel.findOne({
		where: {
			id: verifiedAuthTokenObj.sessionId,
			active: true
		}
	});
	
	if (!session) {
		throw new ApiException('session_error', 'session not found or inactive');
	}
	
	return true;
};

const logoutSession = async (refreshToken) => {
	const verifiedAuthTokenObj = tokenController.getTokenObj(refreshToken, config.jwt.auth.refresh.secretKey);
	
	if (!verifiedAuthTokenObj) {
		throw new ApiException('token_error', 'invalid refresh token');
	}
	
	const session = await SessionModel.findOne({
		where: {
			id: verifiedAuthTokenObj.sessionId,
			refreshToken,
			active: true
		}
	});
	
	if (!session) {
		throw new ApiException('session_not_found', 'active session not found');
	}
	
	session.active = false;
	await session.save();
	
	return true;
};

module.exports = {
	createSession,
	verifyRefreshToken,
	verifySessionByToken,
	logoutSession
};
