/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    uniqueId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    displayName: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    profileImage: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    gender: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    country: {
      type: DataTypes.INTEGER(3),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(3),
      allowNull: true
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'users'
  });
};
