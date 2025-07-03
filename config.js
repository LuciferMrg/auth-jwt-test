const { APP_MODES } = require('./constants/common');
require('dotenv').config();

const config = {
	mode: process.env.NODE_ENV?.trim() || APP_MODES.PROD,
	allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
	prodOrigin: ['', ''],
	devOrigin: ['http://localhost:5173'],
	server: {
		port: process.env.PORT || 3001,
		productionHostName: ''
	},
	db: {
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: 'postgres',
		logging: msg => {
			if (msg.startsWith('Executing')) {
				return;
			}
			console.log(msg);
		}
	},
	jwt: {
		auth: {
			headerKey: 'Authentication',
			access: {
				secretKey: process.env.ACCESS_TOKEN_SECRET,
				expireIn: '15m',
				expire: 15 // todo 180 minutes
			},
			refresh: {
				secretKey: process.env.REFRESH_TOKEN_SECRET,
				expireIn: '7d',
				expire: 10080
			}
		}
	}
};

module.exports = config;