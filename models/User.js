"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      const { User, Role } = models;
      Role.hasMany(User, { foreignKey: "role_id" });
      User.belongsTo(Role, { foreignKey: "role_id" });
    }
    static getUserWithRole() {
      console.log("user with log called");
    }
  }
  User.init(
    {
      fullName: DataTypes.STRING,

      phone_no: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
        defaultValue: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // isVerified: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      //   allowNull: false,
      // },
      // verificationToken: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      appleID: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profilePhoto: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      company: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isdealcreated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      originalTransactionId: {
        type: DataTypes.STRING,
      },
      subscriptionStartDate: {
        type: DataTypes.DATE,
      },
      subscriptionEndDate: {
        type: DataTypes.DATE,
      },
      platformSubscriptionName: {
        type: DataTypes.STRING,
      },
      isSubscriptionValid: {
        type: DataTypes.BOOLEAN,
      },
      subscriptionMessage: {
        type: DataTypes.STRING,
      },
      // phone: {
      //   type: DataTypes.STRING,
      //   allowNull: true
      // }
    },
    {
      indexes: [{ unique: true, fields: ["email"] }],
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
