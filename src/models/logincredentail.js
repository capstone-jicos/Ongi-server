'use strict';
module.exports = (sequelize, DataTypes) => {
  const loginCredentail = sequelize.define('loginCredentail', {
    provider: {
      type : DataTypes.STRING,
      primaryKey : true
    },
    uniqueId: {
      type : DataTypes.STRING,
      primaryKey : true
    },
    userId: DataTypes.STRING,
    accessToken: DataTypes.STRING
  }, {
    timestamps: false,
    freezeTableName: true
  });
  loginCredentail.associate = function(models) {
    // associations can be defined here
  };
  return loginCredentail;
};