'use strict';
module.exports = (sequelize, DataTypes) => {
  const venue = sequelize.define('venue', {
    idx: {
      type : DataTypes.STRING,
      primaryKey : true
    },
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    streetAddress: DataTypes.TEXT,
    detailAddress: DataTypes.TEXT
  }, {
    timestamps: false,
    freezeTableName: true
  });
  venue.associate = function(models) {
    // associations can be defined here
  };
  return venue;
};