const { DataTypes } = require('sequelize');

const sequelize = require('../sequelize-instance');

const SessionModel = sequelize.define('session', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	
	userId: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: 'users',
			key: 'id'
		},
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE'
	},
	
	refreshToken: {
		type: DataTypes.TEXT
	},
	
	ip: {
		type: DataTypes.STRING
	},
	
	userAgent: {
		type: DataTypes.TEXT
	},
	
	started: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	
	expire: {
		type: DataTypes.DATE
	},
	
	active: {
		type: DataTypes.BOOLEAN,
		defaultValue: true
	}
}, {
	tableName: 'sessions',
	timestamps: false // или true, если ты используешь createdAt/updatedAt
});

module.exports = SessionModel;
