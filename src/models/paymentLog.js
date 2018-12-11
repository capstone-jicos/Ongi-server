/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('paymentLog', {
    merchant_uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING(64),
      references: {
        model: 'users',
        key: 'uniqueId'
      }
    },
    receipt_url: {
      type: DataTypes.STRING(128)
    },
    canceled: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'paymentLog',
    timestamps: false,
    freezeTableName: true
  });
};
