"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { Notification, Deal, User, Comment } = models;
      User.hasMany(Notification, { foreignKey: "created_by" });
      Notification.belongsTo(User, { foreignKey: "created_by", as: "creator" });

      User.hasMany(Notification, { foreignKey: "send_to" });
      Notification.belongsTo(User, { foreignKey: "send_to", as: "receiver" });

      Deal.hasMany(Notification, { foreignKey: "deal_Id" });
      Notification.belongsTo(Deal, { foreignKey: "deal_Id" });

      Comment.hasMany(Notification, { foreignKey: "comment_Id" });
      Notification.belongsTo(Comment, { foreignKey: "comment_Id" });
    }
    static getUserWithRole() {
      console.log("user with log called");
    }
  }
  Notification.init(
    {
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      notification_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      read_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );
  return Notification;
};
