const bcrypt = require('bcryptjs');

const UserModel = require('./models/user-model');

const sequelize = require('./sequelize-instance');

async function createAdmin() {
    await sequelize.sync();

    const userAccount = await UserModel.create({
        name: 'test',
        email: 'admin@example.com',
        passwordHash: bcrypt.hashSync('root', 10)
    });

    console.log(`Admin created: ${userAccount.email}`);
}

createAdmin().catch(console.error);
