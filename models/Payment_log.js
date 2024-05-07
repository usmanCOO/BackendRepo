"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment_logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { Payment_logs, Deal } = models;
      Payment_logs.hasMany(Deal, { foreignKey: "payement_Id" });
      Deal.belongsTo(Payment_logs, { foreignKey: "payement_Id" });
    }
    static getUserWithRole() {
      console.log("user with log called");
    }
  }
  Payment_logs.init(
    {
      payment_purchased_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deal_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      payment_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },

      payment_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      payment_response: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Payment_logs",
    }
  );
  return Payment_logs;
};
