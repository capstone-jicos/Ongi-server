/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('venue', {
    idx: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    country: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    streetAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    detailAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    lat: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    lng: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    uniqueId: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: {
        model: 'users',
        key: 'uniqueId'
      }
    }
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'venue'
  });
};
