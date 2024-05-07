
'use strict';
const { BOOLEAN } = require('sequelize');
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class CategoryLabel extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
      
			const { CategoryLabel, Category } = models
			Category.hasMany(CategoryLabel, { foreignKey: "category_id" });
			CategoryLabel.belongsTo(Category, { foreignKey: "category_id" });
		}
    
		
	}
 CategoryLabel.init({
    
    condition: DataTypes.STRING,
    value: DataTypes.STRING,
    color: DataTypes.STRING,


	
 },

	 {
		sequelize,
		modelName:  'CategoryLabel',
	});
	return CategoryLabel;
};