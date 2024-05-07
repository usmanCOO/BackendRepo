"use strict";
const { Model } = require("sequelize");
const video = require("./Video");
module.exports = (sequelize, DataTypes) => {
  class Deal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { User, Deal, Video } = models;
      User.hasMany(Deal, { foreignKey: "deal_created_by" });
      Deal.belongsTo(User, { foreignKey: "deal_created_by" });

      Video.hasMany(Deal, { foreignKey: "is_video_recommended" });
      Deal.belongsTo(Video, { foreignKey: "is_video_recommended" });

      // Deal.belongsToMany(User, { through: "Shared_Deals" });
      // User.belongsToMany(Deal, { through: "Shared_Deals" });
    }
    static async getById(id) {
      const DealExist = await Deal.findOne({ where: { id } });

      return DealExist;
    }
  }
  Deal.init(
    {
      deal_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
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

      is_draft: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      is_video_purchased: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      in_review: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_session_purchased: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      investment_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      closed_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Deal",
    }
  );
  return Deal;
};
