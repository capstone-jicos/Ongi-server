'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    /*
    index: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },*/
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    //name: DataTypes.STRING,
    //role: DataTypes.STRING
  }, {
      timestamps: false,
      freezeTableName: true
  });
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};