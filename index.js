const express = require('express');

const sequelize = require('./sequelize-instance');

const app = express();

app.use(express.json());

app.use('/api', require('./routes/user-route'));

sequelize.authenticate().then(() => {
    console.log('Database connected');
}).catch((err) => {
    console.error('Unable to connect:', err);
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, (err) => {
    if (err) {
        console.error(`Server startup error: ${err}`);
        return;
    }
    console.log(`Server listening on ${HOST}:${PORT}`);
});