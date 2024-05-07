"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserSubscriptions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      const { User, UserSubscriptions } = models;
      User.hasMany(UserSubscriptions, { foreignKey: "userId" });
      UserSubscriptions.belongsTo(UserSubscriptions, { foreignKey: "userId" });
    }
  }
  UserSubscriptions.init(
    {
      originalTransactionId: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "UserSubscriptions",
    }
  );
  return UserSubscriptions;
};
