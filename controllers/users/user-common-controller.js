const bcrypt = require('bcryptjs');

const getPasswordHash = (password) => {
	const saltRounds = 10;
	return bcrypt.hash(password, saltRounds);
};

const checkPasswordHash = (password, passwordHash) => {
	return bcrypt.compare(password, passwordHash);
};

module.exports = {
	getPasswordHash,
	checkPasswordHash
};