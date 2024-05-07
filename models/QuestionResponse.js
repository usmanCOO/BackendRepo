"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class QuestionResponse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { Question, Deal, QuestionResponse } = models;
      Question.hasMany(QuestionResponse, { foreignKey: "question_id" });
      QuestionResponse.belongsTo(Question, { foreignKey: "question_id" });

      Deal.hasMany(QuestionResponse, { foreignKey: "deal_id" });
      QuestionResponse.belongsTo(Deal, { foreignKey: "deal_id" });
    }
  }
  QuestionResponse.init(
    {
      response: DataTypes.STRING,
      metadata: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "QuestionResponse",
    }
  );
  return QuestionResponse;
};
