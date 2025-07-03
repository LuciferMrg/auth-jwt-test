const bcrypt = require('bcryptjs');
const Joi = require('joi');

const { UserModel } = require('../../models');

const userSessionController = require('./user-session-controller');
const tokenController = require('../token-controller');

const { checkPasswordHash } = require('./user-common-controller');
const { ApiException, getJoiErrorMessage } = require('../../utilities/utilities');

const login = async (data, ipAddress, userAgent = '') => {
    const userSchema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    
    const { error: validationError, value: userData } = userSchema.validate({
        ...data
    });
    
    if (validationError) {
        throw new ApiException('data_error', getJoiErrorMessage(validationError, 'some data is incorrect'));
    }
    
    const userAccount = await UserModel.findOne({ where: { username: userData.username } });
    
    if (!userAccount) {
        throw new ApiException('account_not_found_error', 'user account not found');
    }
    
    if (!userAccount.passwordHash) {
        throw new ApiException('password_not_found_error', 'user account password not found');
    }
    
    const checkPasswordResult = await checkPasswordHash(userData.password, userAccount.passwordHash);
    
    if (!checkPasswordResult) {
        throw new ApiException('authorization_error', 'user is not authorized');
    }
    
    const authToken = await userSessionController.createSession(userAccount.id, ipAddress, userAgent);
    
    return {
        accessToken: authToken.accessToken,
        refreshToken: authToken.refreshToken,
        user: {
            id: userAccount.id,
            username: userAccount.username,
            email: userAccount.email
        }
    };
};

const register = async (
  {
      username, email, password, firstName = '', lastName = ''
  },
  ipAddress, userAgent = ''
) => {
    if (!username || !email || !password) {
        throw new ApiException('data_error', 'not all data');
    }
    
    // Проверяем, что email не занят
    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
        throw new ApiException('email_exists_error', 'email is already registered');
    }
    
    // Хэшируем пароль
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Создаем пользователя
    const newUser = await UserModel.create({
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        isActive: true
    });
    
    // Создаем сессию (токены) для нового пользователя
    const authToken = await userSessionController.createSession(newUser.id, ipAddress, userAgent);
    
    return {
        accessToken: authToken.accessToken,
        refreshToken: authToken.refreshToken,
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
        }
    };
};

const refresh = async (data) => {
    const refreshTokenSchema = Joi.object({
        refreshToken: Joi.string().required()
    });
    
    const { error: validationError, value: refreshTokenData } = refreshTokenSchema.validate({
        ...data
    });
    
    if (validationError) {
        throw new ApiException('data_error', getJoiErrorMessage(validationError, 'some data is incorrect'));
    }
    
    const sessionData = await userSessionController.verifyRefreshToken(refreshTokenData.refreshToken);
    const { access } = await tokenController.generateAuthToken(sessionData);
    
    return { accessToken: access };
};

const logout = async (data) => {
    const refreshTokenSchema = Joi.object({
        refreshToken: Joi.string().required()
    });
    
    const { error: validationError, value: refreshTokenData } = refreshTokenSchema.validate({
        ...data
    });
    
    if (validationError) {
        throw new ApiException('data_error', getJoiErrorMessage(validationError, 'some data is incorrect'));
    }
    
    return await userSessionController.logoutSession(refreshTokenData.refreshToken);
};

const getProfile = async (userId) => {
    if (!userId) {
        throw new ApiException('user_id_error', 'user ID is required');
    }
    
    const userAccount = await UserModel.findByPk(userId);
    
    if (!userAccount) {
        throw new ApiException('user_not_found_error', 'user ID not found');
    }
    
    return userAccount;
};

module.exports = {
    login,
    register,
    refresh,
    logout,
    getProfile
};