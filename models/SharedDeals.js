"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SharedDeals extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { Shared_Deals, User } = models;
      // Shared_Deals.belongsTo(models.User, {
      //   foreignKey: "userId",
      //   sourceKey: models.User.id,
      // });
      // Shared_Deals.belongsTo(models.User, {
      //   foreignKey: "createdBy",
      //   sourceKey: models.User.id,
      // });
      // Shared_Deals.belongsTo(User, { foreignKey: "userId" });
      // User.hasMany(Shared_Deals, { as: "userId", foreignKey: "userId" });

      // db.users.hasMany(db.tremendousOrders, { foreignKey: "senderId" });
      // db.tremendousOrders.belongsTo(db.users, {
      //   foreignKey: "senderId",
      //   as: "sender",
      // });

      User.hasMany(Shared_Deals, { foreignKey: "createdBy" });
      Shared_Deals.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

      User.hasMany(Shared_Deals, { foreignKey: "userId" });
      Shared_Deals.belongsTo(User, { foreignKey: "userId", as: "shared_user" });

      Shared_Deals.belongsTo(models.Deal, {
        foreignKey: "dealId",
        sourceKey: models.Deal.id,
      });
    }
  }
  SharedDeals.init(
    {
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // createdBy: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      // },
      // createdBy: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: "Users",
      //     key: "id",
      //   },
      // },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Shared_Deals",
    }
  );
  return SharedDeals;
};
