const { DataTypes } = require('sequelize');

const sequelize = require('../sequelize-instance');

const UserModel = sequelize.define('user', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	firstName: DataTypes.STRING,
	lastName: DataTypes.STRING,
	passwordHash: DataTypes.STRING,
	email: {
		type: DataTypes.STRING,
		unique: true,
		validate: {
			isEmail: true
		}
	},
	// accountType: {
	// 	type: DataTypes.UUID,
	// 	references: {
	// 		model: 'userAccountTypes',
	// 		key: 'id'
	// 	}
	// },
	isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
	tableName: 'users'
});

module.exports = UserModel;
