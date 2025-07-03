const SessionModel = require('./session-model');
const UserModel = require('./user-model');

// Associations
SessionModel.belongsTo(UserModel, {
	foreignKey: {
		name: 'userId',
		allowNull: false
	},
	onDelete: 'CASCADE',
	onUpdate: 'CASCADE'
});

module.exports = {
	SessionModel,
	UserModel
};