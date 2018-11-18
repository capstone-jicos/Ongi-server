/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('paymentLog', {
    transactionId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      references: {
        model: 'users',
        key: 'uniqueId'
      }
    }
  }, {
    tableName: 'paymentLog',
    timestamps: false,
    freezeTableName: true
  });
};
