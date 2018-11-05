/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('loginCredential', {
    provider: {
      type: DataTypes.STRING(3),
      allowNull: false,
      primaryKey: true
    },
    uniqueId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'uniqueId'
      }
    },
    userId: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    accessToken: {
      type: DataTypes.STRING(32),
      allowNull: false
    }
  }, {
    tableName: 'loginCredential'
  });
};
