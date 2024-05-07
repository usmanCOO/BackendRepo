
'use strict';
const { BOOLEAN } = require('sequelize');
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Category extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
      
		}
    
		
	}
 Category.init({
    name:{
	type : DataTypes.STRING,
	allowNull: false,
	} ,
    metadata: DataTypes.JSON,

	order:{
    type:  DataTypes.INTEGER,
	allowNull: true
	},

	is_delete: {
	type: DataTypes.BOOLEAN,
	defaultValue:false
	},

	
 },

	 {
		sequelize,
		modelName:  'Category',
	});
	return Category;
};