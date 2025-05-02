const jwt = require('jsonwebtoken');

const UserModel = require('../models/user-model');

const { checkPasswordHash } = require('./user-common-controller');

const { ApiException } = require('../utilities/utilities');

const login = async (login, password) => {
    if (!login || !password) {
        throw new ApiException('data_error', 'Not all data');
    }

    const userAccount = await UserModel.findOne({ where: { email: login } });

    if (!userAccount) {
        throw new ApiException('account_not_found_error', 'User account not found');
    }

    if (!userAccount.passwordHash) {
        throw new ApiException('password_not_found_error', 'User account password not found');
    }

    const checkPasswordResult = await checkPasswordHash(password, userAccount.passwordHash);

    if (!checkPasswordResult) {
        throw new ApiException('authorization_error', 'User is not authorized');
    }

    const payload = { id: userAccount.id, email: userAccount.email };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });

    return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
            id: userAccount.id,
            name: userAccount.name,
            email: userAccount.email,
        }
    };
};

const refresh = async (refresh_token) => {
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    const payload = { id: decoded.id, email: decoded.email };

    const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    return { access_token: newAccessToken };
};

const getProfile = async (userId) => {
    if (!userId) {
        throw new ApiException('user_id_error', 'User ID is required');
    }

    const userAccount = await UserModel.findByPk(userId);

    if (!userAccount) {
        throw new ApiException('user_not_found_error', 'User ID not found');
    }

    return userAccount;
};

module.exports = {
    login,
    refresh,
    getProfile
};