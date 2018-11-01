'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('users', {
    uniqueId: {
      type : DataTypes.STRING,
      primaryKey: true
    },
    display: DataTypes.STRING,
    profileImage: {
      type : DataTypes.STRING,
      defaultValue : null
    },
    gender: DataTypes.STRING,
    country: {
      type : DataTypes.INTEGER,
      defaultValue : null
    },
    state: {
      type : DataTypes.STRING,
      defaultValue : null
    },
    city: {
      type : DataTypes.STRING,
      defaultValue : null
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};