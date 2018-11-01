'use strict';
module.exports = (sequelize, DataTypes) => {
  const paymentLog = sequelize.define('paymentLog', {
    transactionId: {
      type : DataTypes.STRING,
      primaryKey : true
    },
    userId: DataTypes.STRING
  }, {
    timestamps: false,
    freezeTableName: true
  });
  paymentLog.associate = function(models) {
    // associations can be defined here
  };
  return paymentLog;
};