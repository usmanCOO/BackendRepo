"use strict";
const { Model } = require("sequelize");
const video = require("./Video");
module.exports = (sequelize, DataTypes) => {
  class UserSessions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { User, Deal, Video } = models;
      Deal.hasOne(UserSessions, { foreignKey: "deal_id" });
      UserSessions.belongsTo(Deal, { foreignKey: "deal_id" });

      User.hasMany(UserSessions, { foreignKey: "user_id" });
      UserSessions.belongsTo(User, { foreignKey: "user_id" });

      //   Video.hasMany(Deal, { foreignKey: "is_video_recommended" });
      //   Deal.belongsTo(Video, { foreignKey: "is_video_recommended" });

      // Deal.belongsToMany(User, { through: "Shared_Deals" });
      // User.belongsToMany(Deal, { through: "Shared_Deals" });
    }
    static async getById(id) {
      const DealExist = await UserSessions.findOne({ where: { id } });

      return DealExist;
    }
  }
  UserSessions.init(
    {
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      session_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      session_start_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "UserSessions",
    }
  );
  return UserSessions;
};
