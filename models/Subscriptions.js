"use strict";
const { Model } = require("sequelize");
const video = require("./Video");
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { User, Subscription, Video } = models;
      User.hasMany(Subscription, { foreignKey: "userId" });
      Subscription.belongsTo(Subscription, { foreignKey: "userId" });

      // Deal.belongsToMany(User, { through: "Shared_Deals" });
      // User.belongsToMany(Deal, { through: "Shared_Deals" });
    }
  }
  Subscription.init(
    {
      duration: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startdate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      enddate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Subscription",
    }
  );
  return Subscription;
};
