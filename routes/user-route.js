const express = require('express');

const { verifyToken } = require('../controllers/token-controller');
const UserController = require('../controllers/user-controller');

const { STATUS_CODES, sendResult, sendError } = require('../utilities/utilities');

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/login', (req, res, next) => {
    const login = req.body.login;
    const password = req.body.password;

    UserController.login(login, password)
        .then((result) => sendResult(res, next, STATUS_CODES.SUCCESS, result))
        .catch((error) => sendError(res, next, STATUS_CODES.INTERNAL_SERVER_ERROR, error));
});

router.post('/refresh', (req, res, next) => {
    const refresh_token = req.body.refresh_token;

    UserController.refresh(refresh_token)
        .then((result) => sendResult(res, next, STATUS_CODES.SUCCESS, result))
        .catch((error) => sendError(res, next, STATUS_CODES.INTERNAL_SERVER_ERROR, error));
});

router.get('/profile', verifyToken, async (req, res, next) => {
    const userId = req.user.id;

    UserController.getProfile(userId)
        .then((result) => sendResult(res, next, STATUS_CODES.SUCCESS, result))
        .catch((error) => sendError(res, next, STATUS_CODES.INTERNAL_SERVER_ERROR, error));
});

module.exports = router;
