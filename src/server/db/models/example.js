const Sequelize = require("sequelize");
const db = require("../db");

const Example = db.define("example", {
  text: {
    type: Sequelize.STRING,
    defaultValue: "",
    allowNull: false,
  },
});

module.exports = Example;
