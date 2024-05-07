
'use strict';
const {
	Model
} = require('sequelize');
const User = require('./User');
module.exports = (sequelize, DataTypes) => {
	class Comment extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			const {User, Comment, Deal} = models;
			Deal.hasMany(Comment, {foreignKey: "deal_id"});
			Comment.belongsTo(Deal, {foreignKey: "deal_id"});
			Comment.hasMany(models.Comment, { as: 'Replies', foreignKey: 'replied_to',allowNull:true });
			Comment.belongsTo(models.Comment, { as: 'Comments', foreignKey: 'replied_to' });
			User.hasMany(Comment, {foreignKey: "created_by"});
			Comment.belongsTo(User, {foreignKey: "created_by"});
      
		
		}
    
		
	}
 Comment.init({
    statement: {
		type: DataTypes.STRING,
		allowNull:false,
	},
  
	


	}, {
		sequelize,
		modelName:  'Comment',
	});
	return Comment;
};