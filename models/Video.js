"use strict";
const { Model } = require("sequelize");
const User = require("./User");
module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      const { User, Video } = models;
      User.hasMany(Video, { foreignKey: "video_createed_by" });
      Video.belongsTo(User, { foreignKey: "video_createed_by" });
    }
  }
  Video.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      metadata: DataTypes.STRING,

      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isArchive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Video",
    }
  );
  return Video;
};
