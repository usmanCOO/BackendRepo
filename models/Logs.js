"use strict";
const { Model } = require("sequelize");
const video = require("./Video");
module.exports = (sequelize, DataTypes) => {
  class Logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      const { User, Logs, Video } = models;
      User.hasMany(Logs, { foreignKey: "userID" });
      Logs.belongsTo(User, { foreignKey: "userID" });

      // Deal.belongsToMany(User, { through: "Shared_Deals" });
      // User.belongsToMany(Deal, { through: "Shared_Deals" });
    }
  }
  Logs.init(
    {
      log_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Logs",
    }
  );
  return Logs;
};
