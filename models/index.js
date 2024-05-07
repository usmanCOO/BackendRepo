"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const { roleData } = require("../app/controllers/role");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};
console.log("config", config);
const { database, password, username } = config;
let sequelize;
sequelize = new Sequelize(database, username, password, config);
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

//define relations from relations folder
// fs
// .readdirSync(__dirname+'/relations/')
// .filter(file => {
//   return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
// })
// .forEach(file => {
//    require(path.join(__dirname+'/relations/', file))(sequelize);

// });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//roleData();

module.exports = db;
