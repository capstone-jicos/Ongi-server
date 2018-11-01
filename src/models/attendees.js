'use strict';
module.exports = (sequelize, DataTypes) => {
  const attendees = sequelize.define('attendees', {
    eventId: {
      type : DataTypes.STRING,
      primaryKey : true
    },
    attendeeId: {
      type : DataTypes.STRING,
      primaryKey : true
    },
    attending: DataTypes.INTEGER
  }, {
    timestamps: false,
    freezeTableName: true
  });
  attendees.associate = function(models) {
    // associations can be defined here
  };
  return attendees;
};