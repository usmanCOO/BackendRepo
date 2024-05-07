"use strict";
const { Model } = require("sequelize");
const video = require("./Video");
module.exports = (sequelize, DataTypes) => {
  class Metadata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   // define association here
    //   const { User, IosSubscription, Video } = models;
    //   User.hasMany(IosSubscription, { foreignKey: "userId" });
    //   IosSubscription.belongsTo(IosSubscription, { foreignKey: "userId" });
    //   // Deal.belongsToMany(User, { through: "Shared_Deals" });
    //   // User.belongsToMany(Deal, { through: "Shared_Deals" });
    // }
  }
  Metadata.init(
    {
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Metadata",
    }
  );
  return Metadata;
};
