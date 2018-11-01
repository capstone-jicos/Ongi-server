'use strict';
module.exports = (sequelize, DataTypes) => {
  const userPayments = sequelize.define('userPayments', {
    userId: DataTypes.STRING,
    billingId: {
      type : DataTypes.STRING,
      primaryKey : true
    },
    cardType: DataTypes.STRING,
    cardNum: DataTypes.INTEGER
  }, {
    timestamps: false,
    freezeTableName: true
  });
  userPayments.associate = function(models) {
    // associations can be defined here
  };
  return userPayments;
};