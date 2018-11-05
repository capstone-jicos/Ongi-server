/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userPayments', {
    userId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      references: {
        model: 'users',
        key: 'uniqueId'
      }
    },
    billingId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    cardType: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    cardNum: {
      type: DataTypes.INTEGER(2),
      allowNull: false
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'userPayments'
  });
};
