"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { Question, Category } = models;
      Category.hasMany(Question, { foreignKey: "category_id" });
      Question.belongsTo(Category, { foreignKey: "category_id" });
    }
  }
  Question.init(
    {
      statement: DataTypes.STRING,
      metadata: DataTypes.STRING,
      sequence: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Question",
    }
  );
  return Question;
};
