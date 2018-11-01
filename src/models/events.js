'use strict';
module.exports = (sequelize, DataTypes) => {
  const events = sequelize.define('events', {
    idx: {
      type : DataTypes.STRING,
      primaryKey : true
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    hostId: DataTypes.STRING,
    venueId: DataTypes.STRING,
    feeAmount: DataTypes.INTEGER
  }, {
    timestamps: false,
    freezeTableName: true
  });
  events.associate = function(models) {
    // associations can be defined here
  };
  return events;
};