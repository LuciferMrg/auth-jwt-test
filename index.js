const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('./config');

const sequelize = require('./sequelize-instance');

const app = express();

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
	origin: process.env.NODE_ENV !== 'production' ? config.devOrigin : config.prodOrigin,
	methods: config.allowMethods,
	allowedHeaders: ['Content-Type', 'Authorization', 'Authentication'],
	maxAge: 86400,
	credentials: true
};

app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

app.use('/users', require('./routes/user-route'));

const db = require('./models');

sequelize.authenticate()
	.then(() => {
		console.log('Database connected');
		
		return sequelize.sync({ force: false });
	})
	.then(() => {
		console.log('All tables synced');
		
	})
	.catch((err) => {
		console.error('Database error:', err);
	});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.get('/', (req, res) => {
	res.send('The site is available.');
});

app.listen(PORT, HOST, (err) => {
	if (err) {
		console.error(`Server startup error: ${err}`);
		return;
	}
	
	console.log(`Server listening on ${HOST}:${PORT}`);
});